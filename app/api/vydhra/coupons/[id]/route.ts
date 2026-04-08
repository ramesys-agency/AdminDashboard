import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getCouponById } from "@/lib/coupon";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const coupon = await getCouponById(id as string);
  
  if (!coupon) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  return NextResponse.json(coupon);
});
