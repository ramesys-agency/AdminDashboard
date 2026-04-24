import { NextResponse } from "next/server";
import { upsertStudent, createEnrollment } from "@/lib/student";
import prisma from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      country,
      courseSlug,
      courseName,
      amount, // in USD (number)
      currency = "USD",
      couponCode,
    } = body;

    // --- Validate required fields ---
    if (!name || !email || !courseSlug || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, courseSlug, amount" },
        { status: 400 }
      );
    }

    // --- Find course in DB by name matching the slug ---
    const vydhra = await prisma.business.findFirst({
      where: { type: "COURSE_SELLING" },
      select: { id: true },
    });

    if (!vydhra) {
      return NextResponse.json({ error: "Vydhra business not found" }, { status: 500 });
    }

    // Try to find course by name (case-insensitive partial match using courseName or slugified match)
    let course = await prisma.course.findFirst({
      where: {
        businessId: vydhra.id,
        name: { contains: courseName || courseSlug, mode: "insensitive" },
      },
    });

    // If not found, use the first course as fallback (for dev/testing)
    if (!course) {
      course = await prisma.course.findFirst({
        where: { businessId: vydhra.id },
      });
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found in database" }, { status: 404 });
    }

    // --- Resolve coupon if provided ---
    let coupon: { id: string; discountType: string; discountValue: number } | null = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          businessId: vydhra.id,
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } },
          ],
        },
        select: { id: true, discountType: true, discountValue: true },
      });
    }

    // --- Upsert student ---
    const student = await upsertStudent({ name, email, phone, country });

    // --- Create enrollment ---
    const enrollment = await createEnrollment(student.id, course.id);

    // --- Create Razorpay order ---
    const amountInPaise = Math.round(amount * 100);
    const receipt = `rcpt_${enrollment.id.slice(-8)}_${Date.now().toString(36)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "USD",
      receipt,
      notes: {
        studentId: student.id,
        studentName: name,
        studentEmail: email,
        courseId: course.id,
        courseName: course.name,
        enrollmentId: enrollment.id,
        couponId: coupon?.id ?? "",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      studentId: student.id,
      enrollmentId: enrollment.id,
      courseId: course.id,
      couponId: coupon?.id ?? null,
    });
  } catch (error: unknown) {
    console.error("[PUBLIC /enroll] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
