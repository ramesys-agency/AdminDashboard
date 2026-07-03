import { NextResponse } from "next/server";
import crypto from "crypto";
import { completePaymentAndEnrollment } from "@/lib/payment";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // --- Verify Webhook Signature (If Secret Configured) ---
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
      }
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else {
      console.warn(
        "[Razorpay Webhook] Warning: RAZORPAY_WEBHOOK_SECRET is not defined. Signature verification skipped."
      );
    }

    const body = JSON.parse(rawBody);
    const { event, payload } = body;

    // --- Handle payment.captured Event ---
    if (event === "payment.captured") {
      const paymentEntity = payload?.payment?.entity;
      if (!paymentEntity) {
        return NextResponse.json({ error: "Missing payment entity in payload" }, { status: 400 });
      }

      const {
        id: razorpayPaymentId,
        order_id: razorpayOrderId,
        amount: amountInPaise,
        currency,
        method,
        notes,
      } = paymentEntity;

      const { studentId, enrollmentId, courseId, couponId, referrerStudentId } = notes || {};

      if (!studentId || !enrollmentId) {
        console.error("[Razorpay Webhook] Missing studentId or enrollmentId in payment notes:", notes);
        return NextResponse.json(
          { error: "Missing required metadata in payment notes" },
          { status: 400 }
        );
      }

      // Convert from paise/cents to major units (e.g., USD, INR)
      const amount = amountInPaise / 100;

      // Complete payment and enrollment via helper
      const result = await completePaymentAndEnrollment({
        amount,
        currency: (currency || "USD").toUpperCase(),
        studentId,
        enrollmentId,
        courseId: courseId || null,
        couponId: couponId || null,
        referrerStudentId: referrerStudentId || null,
        razorpayOrderId: razorpayOrderId || "",
        razorpayPaymentId,
        razorpaySignature: signature || "webhook",
        method: method || "RAZORPAY",
      });

      return NextResponse.json({
        success: true,
        message: result.alreadyProcessed
          ? "Payment already processed previously"
          : "Payment and enrollment successfully completed",
      });
    }

    // Return 200 for unhandled events to prevent retries
    return NextResponse.json({ success: true, message: `Event '${event}' received but not processed` });
  } catch (error: unknown) {
    console.error("[Razorpay Webhook] Error processing webhook:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
