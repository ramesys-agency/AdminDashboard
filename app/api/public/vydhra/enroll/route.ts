import { NextResponse } from "next/server";
import { upsertStudent, createEnrollment } from "@/lib/student";
import prisma from "@/lib/prisma";
import { getUsdToInrRate, resolvePrice } from "@/lib/exchange";
import { resolveCodeAndQuote, quoteTotals } from "@/lib/pricing";
import { getVydhraBusinessId } from "@/lib/business";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const SUPPORTED_CURRENCIES = ["USD", "INR"];

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
      currency: rawCurrency = "USD",
      couponCode,
      batchId,
      acceptedTerms,
    } = body;

    // --- Validate required fields ---
    if (!name || !email || !courseSlug) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, courseSlug" },
        { status: 400 }
      );
    }

    const currency = String(rawCurrency).toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      return NextResponse.json(
        { error: `Unsupported currency: ${currency}` },
        { status: 400 }
      );
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        { error: "You must agree to the Terms & Conditions to enroll." },
        { status: 400 }
      );
    }

    // --- Find course in DB ---
    const businessId = await getVydhraBusinessId();

    let course = await prisma.course.findFirst({
      where: { businessId, slug: courseSlug },
      include: { pricing: true },
    });

    if (!course && courseName) {
      course = await prisma.course.findFirst({
        where: {
          businessId,
          name: { contains: courseName, mode: "insensitive" },
        },
        include: { pricing: true },
      });
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found in database" }, { status: 404 });
    }

    // --- Validate batch if provided ---
    let batch:
      | { id: string; maxSeats: number | null; courseId: string; pricing: { currency: string; amount: number }[] }
      | null = null;
    if (batchId) {
      batch = await prisma.courseBatch.findUnique({
        where: { id: batchId },
        select: { id: true, maxSeats: true, courseId: true, pricing: true },
      });

      if (!batch || batch.courseId !== course.id) {
        return NextResponse.json({ error: "Invalid batch for this course" }, { status: 400 });
      }

      if (batch.maxSeats !== null) {
        const seatsTaken = await prisma.courseEnrollment.count({
          where: {
            batchId,
            status: { notIn: ["PENDING", "EXPIRED"] },
          },
        });
        if (seatsTaken >= batch.maxSeats) {
          return NextResponse.json({ error: "This batch is full" }, { status: 400 });
        }
      }
    }

    // --- Compute the amount server-side from DB pricing ---
    // Never trust a client-supplied amount: base price comes from batch/course
    // pricing, the discount from the coupon tables, GST from the currency.
    const usdToInrRate = await getUsdToInrRate();

    const basePrice =
      (batch ? resolvePrice(batch.pricing, currency, usdToInrRate) : null) ??
      resolvePrice(course.pricing, currency, usdToInrRate);

    if (basePrice === null || basePrice <= 0) {
      return NextResponse.json(
        { error: `No ${currency} pricing configured for this course` },
        { status: 400 }
      );
    }

    // --- Resolve coupon / student referral code and compute the quote ---
    // Shared with /coupon/validate so the preview and the charge always agree.
    let coupon: { id: string } | null = null;
    let referrerStudentId: string | null = null;
    let discountAmount = 0;
    let { gstAmount, total } = quoteTotals(basePrice, 0, currency);
    if (couponCode) {
      const quote = await resolveCodeAndQuote({
        code: String(couponCode),
        basePrice,
        currency,
        email,
        usdToInrRate,
      });

      if (!quote.valid) {
        return NextResponse.json({ error: quote.error }, { status: 400 });
      }

      coupon = quote.couponId ? { id: quote.couponId } : null;
      referrerStudentId = quote.referrerStudentId;
      discountAmount = quote.discountAmount;
      gstAmount = quote.gstAmount;
      total = quote.total;
    }

    if (total <= 0) {
      return NextResponse.json(
        { error: "Computed amount is zero — cannot create a payment order" },
        { status: 400 }
      );
    }

    // --- Upsert student ---
    const student = await upsertStudent({ name, email, phone, country });

    // --- Create enrollment ---
    const enrollment = await createEnrollment(student.id, course.id, batchId ?? null, true, new Date());

    // --- Create Razorpay order ---
    const amountInPaise = Math.round(total * 100);
    const receipt = `rcpt_${enrollment.id.slice(-8)}_${Date.now().toString(36)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        studentId: student.id,
        studentName: name,
        studentEmail: email,
        courseId: course.id,
        courseName: course.name,
        enrollmentId: enrollment.id,
        batchId: batch?.id ?? "",
        couponId: coupon?.id ?? "",
        referrerStudentId: referrerStudentId ?? "",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount, // in paise/cents
      currency: order.currency,
      totalAmount: total, // in major units, server-computed
      basePrice,
      discountAmount: Math.round(discountAmount * 100) / 100,
      gstAmount,
      studentId: student.id,
      enrollmentId: enrollment.id,
      courseId: course.id,
      batchId: batch?.id ?? null,
      couponId: coupon?.id ?? null,
      referrerStudentId: referrerStudentId ?? null,
    });
  } catch (error: unknown) {
    console.error("[PUBLIC /enroll] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
