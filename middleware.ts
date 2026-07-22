import { NextRequest, NextResponse } from "next/server";

// --- Rate limiting (per-instance, in-memory sliding window) ---
// The public validate/enroll endpoints are unauthenticated oracles for
// guessing referral/coupon codes — throttle them per IP. In-memory is fine
// for a single-instance deployment; swap for Redis/Upstash if this ever
// runs on multiple instances.
const RATE_LIMITS: { prefix: string; limit: number; windowMs: number }[] = [
  { prefix: "/api/public/vydhra/coupon/validate", limit: 10, windowMs: 60_000 },
  { prefix: "/api/public/vydhra/enroll", limit: 5, windowMs: 60_000 },
  { prefix: "/api/public/vydhra/referral-apply", limit: 5, windowMs: 60_000 },
];

const hits = new Map<string, number[]>();

function isRateLimited(request: NextRequest): boolean {
  const rule = RATE_LIMITS.find((r) => request.nextUrl.pathname.startsWith(r.prefix));
  if (!rule || request.method === "OPTIONS") return false;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const key = `${rule.prefix}:${ip}`;
  const now = Date.now();

  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < rule.windowMs);
  if (timestamps.length >= rule.limit) {
    hits.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  hits.set(key, timestamps);

  // Opportunistic cleanup so the map can't grow unbounded
  if (hits.size > 10_000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= 60_000)) hits.delete(k);
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (allowedOrigins.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  } else {
    corsHeaders["Access-Control-Allow-Origin"] = allowedOrigins[0] || "*";
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "Too many requests — please try again in a minute" },
      { status: 429, headers: corsHeaders }
    );
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = {
  matcher: "/api/public/:path*",
};
