import { NextResponse } from "next/server";
import crypto from "crypto";
import { completePaymentAndEnrollment, reversePaymentEffects } from "@/lib/payment";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // --- Verify Webhook Signature ---
    // The signature is the ONLY thing authenticating this endpoint — an
    // unsigned webhook would let anyone forge payment.captured events and
    // mint free enrollments + commissions. Never process without it.
    if (!webhookSecret) {
      console.error("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured — rejecting webhook");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }
    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");
    const signatureValid =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!signatureValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
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

    // --- Handle payment.failed Event ---
    // Only meaningful when we already recorded the payment (verify accepted
    // an `authorized` payment whose capture later failed) — otherwise a no-op.
    if (event === "payment.failed") {
      const paymentEntity = payload?.payment?.entity;
      if (paymentEntity?.id) {
        const result = await reversePaymentEffects({
          razorpayPaymentId: paymentEntity.id,
          newStatus: "FAILED",
        });
        if (result.reversed) {
          console.error(
            `[Razorpay Webhook] Capture failed after verify — reversed payment ${paymentEntity.id}`
          );
        }
      }
      return NextResponse.json({ success: true, message: "payment.failed processed" });
    }

    // --- Handle refund.processed Event ---
    // Full refunds unwind the enrollment, coupon usage, and commission
    // credits. Partial refunds are logged for manual handling.
    if (event === "refund.processed") {
      const refundEntity = payload?.refund?.entity;
      const paymentEntity = payload?.payment?.entity;
      if (refundEntity?.payment_id) {
        if (paymentEntity && refundEntity.amount < paymentEntity.amount) {
          console.error(
            `[Razorpay Webhook] Partial refund on ${refundEntity.payment_id} ` +
            `(${refundEntity.amount}/${paymentEntity.amount} paise) — not auto-reversed, handle manually.`
          );
        } else {
          await reversePaymentEffects({
            razorpayPaymentId: refundEntity.payment_id,
            newStatus: "REFUNDED",
          });
        }
      }
      return NextResponse.json({ success: true, message: "refund.processed handled" });
    }

    // Return 200 for unhandled events to prevent retries
    return NextResponse.json({ success: true, message: `Event '${event}' received but not processed` });
  } catch (error: unknown) {
    console.error("[Razorpay Webhook] Error processing webhook:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
