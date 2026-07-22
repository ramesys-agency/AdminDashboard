import prisma from "@/lib/prisma";
import { getVydhraBusinessId } from "@/lib/business";
import { resolveStudentReferral } from "@/lib/referral";

export const INR_GST_RATE = 0.18;

const round2 = (n: number) => Math.round(n * 100) / 100;

export type QuoteResolution =
  | { valid: false; error: string }
  | {
      valid: true;
      kind: "coupon" | "referral";
      couponId: string | null;
      referrerStudentId: string | null;
      code: string;
      discountType: "PERCENTAGE" | "FLAT";
      /** Display value: percentage number, or FLAT amount converted to the checkout currency. */
      discountValue: number;
      discountAmount: number;
      subtotal: number;
      gstAmount: number;
      total: number;
    };

/**
 * Resolves a checkout code (coupon first, then student referral — they share
 * one namespace) and computes the full quote including GST. This is the ONE
 * place discount + GST math lives: /coupon/validate (the UI preview) and
 * /enroll (the actual order) both call it, so the number the buyer sees is
 * the number Razorpay charges.
 *
 * FLAT student referral discounts are denominated in USD; coupon FLAT
 * discounts are per-currency with a USD→INR conversion fallback.
 */
export async function resolveCodeAndQuote(params: {
  code: string;
  basePrice: number;
  currency: string;
  /** Buyer email — blocks self-use of a referral code when provided. */
  email?: string | null;
  usdToInrRate: number;
}): Promise<QuoteResolution> {
  const { basePrice, usdToInrRate } = params;
  const currency = params.currency.toUpperCase();
  const normalizedCode = String(params.code).toUpperCase().trim();

  const businessId = await getVydhraBusinessId();

  let kind: "coupon" | "referral";
  let couponId: string | null = null;
  let referrerStudentId: string | null = null;
  let code: string;
  let discountType: "PERCENTAGE" | "FLAT";
  let discountValue: number;
  let discountAmount: number;

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: normalizedCode,
      businessId,
      OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
    },
    include: { discounts: true },
  });

  if (coupon) {
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      return { valid: false, error: "This coupon has reached its usage limit" };
    }

    let discount = coupon.discounts.find((d) => d.currency.toUpperCase() === currency);
    let flatNeedsConversion = false;
    if (!discount && currency === "INR") {
      discount = coupon.discounts.find((d) => d.currency.toUpperCase() === "USD");
      flatNeedsConversion = !!discount;
    }
    if (!discount) {
      return { valid: false, error: `This coupon is not available in ${currency}` };
    }

    kind = "coupon";
    couponId = coupon.id;
    code = coupon.code;
    discountType = discount.discountType;
    if (discount.discountType === "PERCENTAGE") {
      discountValue = discount.discountValue;
      discountAmount = (basePrice * discount.discountValue) / 100;
    } else {
      discountAmount = flatNeedsConversion
        ? discount.discountValue * usdToInrRate
        : discount.discountValue;
      discountValue = round2(discountAmount);
    }
  } else {
    // Not a coupon — try to resolve as a student referral code
    const referral = await resolveStudentReferral(normalizedCode);
    if (!referral) {
      return { valid: false, error: "Invalid or expired coupon code" };
    }

    if (
      params.email &&
      String(params.email).toLowerCase().trim() === referral.student.email.toLowerCase()
    ) {
      return { valid: false, error: "You cannot use your own referral code" };
    }

    kind = "referral";
    referrerStudentId = referral.student.id;
    code = referral.student.referralCode ?? normalizedCode;
    discountType = referral.discountType;
    if (referral.discountType === "PERCENTAGE") {
      discountValue = referral.discountValue;
      discountAmount = (basePrice * referral.discountValue) / 100;
    } else {
      // FLAT student referral discounts are denominated in USD
      discountAmount =
        currency === "INR" ? referral.discountValue * usdToInrRate : referral.discountValue;
      discountValue = round2(discountAmount);
    }
  }

  const quote = quoteTotals(basePrice, discountAmount, currency);
  return {
    valid: true,
    kind,
    couponId,
    referrerStudentId,
    code,
    discountType,
    discountValue,
    discountAmount: round2(discountAmount),
    ...quote,
  };
}

/** Subtotal → GST → total for a given currency (GST applies to INR only). */
export function quoteTotals(basePrice: number, discountAmount: number, currency: string) {
  const subtotal = round2(Math.max(0, basePrice - discountAmount));
  const gstRate = currency.toUpperCase() === "INR" ? INR_GST_RATE : 0;
  const gstAmount = round2(subtotal * gstRate);
  const total = round2(subtotal + gstAmount);
  return { subtotal, gstAmount, total };
}
