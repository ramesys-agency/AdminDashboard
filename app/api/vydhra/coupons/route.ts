import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { createCoupon, getCoupons } from "@/lib/coupon";

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("q") || undefined;

  const result = await getCoupons({ page, limit, search });
  return NextResponse.json(result);
});

export const POST = withAuth(async (req) => {
  const body = await req.json();
  try {
    const coupon = await createCoupon(body);
    return NextResponse.json(coupon);
  } catch (err) {
    // Shared-namespace collision (agent / coupon / student referral code)
    if (err instanceof Error && err.message.includes("already in use")) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
});
