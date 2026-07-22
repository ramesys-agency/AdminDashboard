import { NextResponse } from "next/server";
import { getUsdToInrRate } from "@/lib/exchange";
import { resolveCodeAndQuote } from "@/lib/pricing";

// Preview endpoint for the checkout UI. Uses the SAME quote function as
// /enroll (order creation), so the discount/GST/total shown here always
// matches the amount Razorpay will charge.
export async function POST(req: Request) {
  try {
    const { code, amount, currency = "USD", email } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const usdToInrRate = await getUsdToInrRate();
    const quote = await resolveCodeAndQuote({
      code: String(code),
      basePrice: Number(amount) || 0,
      currency: String(currency),
      email,
      usdToInrRate,
    });

    if (!quote.valid) {
      return NextResponse.json({ valid: false, error: quote.error });
    }

    return NextResponse.json({
      valid: true,
      ...(quote.kind === "referral"
        ? { referral: true, referrerStudentId: quote.referrerStudentId }
        : { couponId: quote.couponId }),
      code: quote.code,
      currency,
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      discountAmount: quote.discountAmount,
      // Discounted subtotal before GST — kept for backward compatibility.
      finalAmount: quote.subtotal,
      // GST-inclusive numbers; matches the Razorpay order amount at /enroll.
      gstAmount: quote.gstAmount,
      totalAmount: quote.total,
    });
  } catch (error: unknown) {
    console.error("[PUBLIC /coupon/validate] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
