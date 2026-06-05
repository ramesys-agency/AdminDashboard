import { NextResponse } from "next/server";
import crypto from "crypto";
import { completePaymentAndEnrollment } from "@/lib/payment";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      studentId,
      enrollmentId,
      courseId,
      couponId,
      amount, // in USD (number)
      currency = "USD",
    } = body;

    // --- Validate required fields ---
    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !studentId ||
      !enrollmentId ||
      !amount
    ) {
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

    // --- Process Payment and Enrollment Completion ---
    const result = await completePaymentAndEnrollment({
      amount,
      currency,
      studentId,
      enrollmentId,
      courseId,
      couponId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return NextResponse.json({
      success: true,
      paymentId: result.payment.id,
      razorpayPaymentId,
      amount,
      student: result.student,
      course: result.course,
      paidAt: result.payment.createdAt,
    });
  } catch (error: unknown) {
    console.error("[PUBLIC /payment/verify] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
