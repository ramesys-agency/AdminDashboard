import { NextResponse } from "next/server";
import crypto from "crypto";
import { completePaymentAndEnrollment } from "@/lib/payment";
import { ensureStudentReferralCode, getReferralSettings } from "@/lib/referral";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Only the Razorpay identifiers are taken from the client. Everything
    // else (studentId, enrollmentId, couponId, referrerStudentId, ...) is
    // read from the order notes set server-side at order creation — a client
    // could otherwise credit commission to an arbitrary coupon/referrer.
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    // --- Validate required fields ---
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    // --- Verify Razorpay signature ---
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Payment verification failed: invalid signature" }, { status: 400 });
    }

    // --- Fetch the payment from Razorpay: the captured amount/currency is
    // authoritative, never the client-supplied value ---
    const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

    if (razorpayPayment.order_id !== razorpayOrderId) {
      return NextResponse.json(
        { error: "Payment verification failed: order mismatch" },
        { status: 400 }
      );
    }

    if (razorpayPayment.status !== "captured" && razorpayPayment.status !== "authorized") {
      return NextResponse.json(
        { error: `Payment not completed (status: ${razorpayPayment.status})` },
        { status: 400 }
      );
    }

    const amount = Number(razorpayPayment.amount) / 100; // paise → major units
    const currency = (razorpayPayment.currency || "USD").toUpperCase();

    // --- Resolve enrollment metadata from the order notes (server-set at
    // order creation, echoed back by Razorpay on the payment entity) ---
    const notes = (razorpayPayment.notes ?? {}) as Record<string, string>;
    const studentId = notes.studentId;
    const enrollmentId = notes.enrollmentId;
    if (!studentId || !enrollmentId) {
      return NextResponse.json(
        { error: "Payment verification failed: missing order metadata" },
        { status: 400 }
      );
    }

    // Deliberately NOT re-checking the course's Coming Soon status here (or in
    // the webhook): by this point the student has already been charged. The
    // gate belongs at order creation in /enroll, which is the only endpoint
    // that mints Razorpay orders. Refusing a captured payment because the
    // course flipped to Coming Soon after checkout started would take the
    // money and leave no enrollment behind.

    // --- Process Payment and Enrollment Completion ---
    const result = await completePaymentAndEnrollment({
      amount,
      currency,
      studentId,
      enrollmentId,
      courseId: notes.courseId || null,
      couponId: notes.couponId || null,
      referrerStudentId: notes.referrerStudentId || null,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    // Give the enrolled student their own referral code so the success page
    // can invite them to refer friends (best-effort — never block the receipt)
    let referral: {
      code: string;
      discountType: string;
      discountValue: number;
      commissionType: string;
      commissionValue: number;
    } | null = null;
    try {
      const settings = await getReferralSettings();
      if (settings.studentReferralEnabled) {
        const code = await ensureStudentReferralCode(studentId);
        referral = {
          code,
          discountType: settings.studentDiscountType,
          discountValue: settings.studentDiscountValue,
          commissionType: settings.studentCommissionType,
          commissionValue: settings.studentCommissionValue,
        };
      }
    } catch (err) {
      console.error("[PUBLIC /payment/verify] Referral code generation failed:", err);
    }

    return NextResponse.json({
      success: true,
      paymentId: result.payment.id,
      razorpayPaymentId,
      amount,
      currency,
      student: result.student,
      course: result.course,
      paidAt: result.payment.createdAt,
      referral,
    });
  } catch (error: unknown) {
    console.error("[PUBLIC /payment/verify] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
