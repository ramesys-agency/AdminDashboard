import { NextResponse } from "next/server";
import crypto from "crypto";
import { createPayment } from "@/lib/payment";
import prisma from "@/lib/prisma";

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

    // --- Record payment in DB ---
    const payment = await createPayment({
      amount,
      currency,
      status: "COMPLETED",
      method: "RAZORPAY",
      studentId,
      courseEnrollmentId: enrollmentId,
      couponId: couponId ?? null,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    // --- Update coupon usage if applied ---
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { currentUses: { increment: 1 } },
      });
    }

    // --- Update enrollment to PAID status ---
    await prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: { status: "PAID" },
    });

    // Build receipt data for the frontend
    const studentData = await prisma.student.findUnique({
      where: { id: studentId },
      select: { name: true, email: true, phone: true, country: true },
    });

    const courseData = courseId
      ? await prisma.course.findUnique({
          where: { id: courseId },
          select: { name: true, description: true },
        })
      : null;

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      razorpayPaymentId,
      amount,
      student: studentData,
      course: courseData,
      paidAt: payment.createdAt,
    });
  } catch (error: unknown) {
    console.error("[PUBLIC /payment/verify] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
