import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUsdToInrRate } from "@/lib/exchange";

export async function POST(req: Request) {
  try {
    const { code, amount, currency = "USD" } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const vydhra = await prisma.business.findFirst({
      where: { type: "COURSE_SELLING" },
      select: { id: true },
    });

    if (!vydhra) {
      return NextResponse.json({ error: "Vydhra business not found" }, { status: 500 });
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase().trim(),
        businessId: vydhra.id,
        OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
      },
      include: { discounts: true },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid or expired coupon code" });
    }

    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" });
    }

    let discount = coupon.discounts.find((d) => d.currency === currency.toUpperCase());
    let isINRConverted = false;
    let exchangeRate = 1;

    if (!discount && currency.toUpperCase() === "INR") {
      discount = coupon.discounts.find((d) => d.currency === "USD");
      if (discount) {
        isINRConverted = true;
        exchangeRate = await getUsdToInrRate();
      }
    }

    if (!discount) {
      return NextResponse.json({
        valid: false,
        error: `This coupon is not available in ${currency.toUpperCase()}`,
      });
    }

    let discountAmount = 0;
    if (discount.discountType === "PERCENTAGE") {
      discountAmount = (amount * discount.discountValue) / 100;
    } else {
      if (isINRConverted) {
        discountAmount = discount.discountValue * exchangeRate;
      } else {
        discountAmount = discount.discountValue;
      }
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      currency,
      discountType: discount.discountType,
      discountValue: isINRConverted && discount.discountType === "FLAT" 
        ? parseFloat((discount.discountValue * exchangeRate).toFixed(2))
        : discount.discountValue,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
    });
  } catch (error: unknown) {
    console.error("[PUBLIC /coupon/validate] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
