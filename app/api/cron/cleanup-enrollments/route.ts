import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const STALE_AFTER_MS = 48 * 60 * 60 * 1000;

/**
 * Marks abandoned checkouts (PENDING enrollments older than 48h with no
 * payment) as EXPIRED instead of deleting them — keeps the funnel measurable
 * while stopping the table from growing forever. Seat counting ignores both
 * PENDING and EXPIRED.
 *
 * Trigger daily (e.g. Vercel cron) with: Authorization: Bearer $CRON_SECRET
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - STALE_AFTER_MS);
    const result = await prisma.courseEnrollment.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: cutoff },
        payments: { none: {} },
      },
      data: { status: "EXPIRED" },
    });

    return NextResponse.json({ success: true, expired: result.count });
  } catch (error) {
    console.error("[Cron cleanup-enrollments] Error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
