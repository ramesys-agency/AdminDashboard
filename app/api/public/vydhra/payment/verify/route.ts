import { NextResponse } from "next/server";
import crypto from "crypto";
import { completePaymentAndEnrollment } from "@/lib/payment";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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
    } = body;

    // --- Validate required fields ---
    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !studentId ||
      !enrollmentId
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
      currency,
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
