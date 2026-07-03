import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendEnrollmentConfirmationEmail } from "@/lib/email";
import { getUsdToInrRate } from "@/lib/exchange";

export type GetPaymentsParams = {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  projectId?: string;
  invoiceId?: string;
};

export async function getPayments({ 
  page = 1, 
  limit = 10, 
  status, 
  method,
  projectId,
  invoiceId
}: GetPaymentsParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {
    business: { type: "COURSE_SELLING" },
    ...(status && status !== "all" && { status }),
    ...(method && method !== "all" && { method }),
    ...(projectId && { projectId }),
    ...(invoiceId && { invoiceId }),
  };

  const [total, data] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: {
        student: { select: { name: true, email: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    data,
    metadata: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      student: true,
      project: true,
      agent: true,
      coupon: true,
      invoice: true,
      courseEnrollment: {
        include: {
          course: { select: { id: true, name: true, slug: true } },
          batch: { select: { id: true, name: true, startDate: true, endDate: true } },
        },
      },
    },
  });
}

import { incrementAgentEarnings } from "@/lib/agent";

export async function updatePaymentStatus(id: string, status: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { agentId: true, amount: true, currency: true, status: true }
  });

  if (!payment) throw new Error("Payment not found");

  // If status is being changed to COMPLETED and it was not COMPLETED before
  if (status === "COMPLETED" && payment.status !== "COMPLETED" && payment.agentId) {
    await incrementAgentEarnings(
      payment.agentId,
      await toUsd(payment.amount, payment.currency ?? "USD")
    );
  }

  return prisma.payment.update({
    where: { id },
    data: { status }
  });
}

// Agent earnings (Agent.totalEarned) are tracked in USD — payments in other
// currencies must be converted before incrementing.
async function toUsd(amount: number, currency: string): Promise<number> {
  if (currency.toUpperCase() !== "INR") return amount;
  const rate = await getUsdToInrRate();
  return Math.round((amount / rate) * 100) / 100;
}

export async function createPayment(data: {
  amount: number;
  currency?: string;
  status: string;
  method?: string;
  studentId: string;
  courseEnrollmentId?: string;
  couponId?: string;
  agentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  acceptedTerms?: boolean;
  acceptedTermsAt?: Date | null;
}) {
  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });

  if (!vydhra) throw new Error("Vydhra business not found");

  const amount = Number(data.amount);
  const currency = (data.currency ?? "USD").toUpperCase();

  let exchangeRate = 1.0;
  let amountInINR = amount;

  if (currency === "USD") {
    exchangeRate = await getUsdToInrRate();
    amountInINR = amount * exchangeRate;
  }

  return prisma.$transaction(async (tx) => {
    // Create invoice first
    const invoice = await tx.invoice.create({
      data: {
        businessId: vydhra.id,
        amount,
        status: data.status === "COMPLETED" ? "PAID" : "PENDING",
        dueDate: new Date(),
      },
    });

    // Create payment linked to the invoice
    return tx.payment.create({
      data: {
        businessId: vydhra.id,
        invoiceId: invoice.id,
        amount,
        currency,
        amountInINR,
        exchangeRate,
        status: data.status,
        method: data.method || "RAZORPAY",
        studentId: data.studentId,
        courseEnrollmentId: data.courseEnrollmentId || null,
        couponId: data.couponId || null,
        agentId: data.agentId || null,
        razorpayOrderId: data.razorpayOrderId || null,
        razorpayPaymentId: data.razorpayPaymentId || null,
        razorpaySignature: data.razorpaySignature || null,
        acceptedTerms: data.acceptedTerms ?? false,
        acceptedTermsAt: data.acceptedTermsAt ?? null,
      },
    });
  });
}

export async function completePaymentAndEnrollment(params: {
  amount: number;
  currency: string;
  studentId: string;
  enrollmentId: string;
  courseId?: string | null;
  couponId?: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  method?: string;
}) {
  const {
    amount,
    currency,
    studentId,
    enrollmentId,
    courseId,
    couponId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    method = "RAZORPAY",
  } = params;

  // 1. Prevent duplicate processing
  const existingPayment = await prisma.payment.findFirst({
    where: { razorpayPaymentId },
  });
  if (existingPayment) {
    return { success: true, alreadyProcessed: true, payment: existingPayment };
  }

  // 2. Resolve agentId if couponId is present
  let agentId: string | null = null;
  if (couponId) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: { code: true },
    });
    if (coupon) {
      const agent = await prisma.agent.findUnique({
        where: { code: coupon.code },
        select: { id: true },
      });
      if (agent) {
        agentId = agent.id;
      }
    }
  }

  // 3. Create payment record
  const payment = await createPayment({
    amount,
    currency,
    status: "COMPLETED",
    method,
    studentId,
    courseEnrollmentId: enrollmentId,
    couponId: couponId ?? undefined,
    agentId: agentId ?? undefined,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    acceptedTerms: true,
    acceptedTermsAt: new Date(),
  });

  // 4. Update coupon usage
  if (couponId) {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { currentUses: { increment: 1 } },
    });
  }

  // 5. Increment Agent Earnings (tracked in USD)
  if (agentId) {
    await incrementAgentEarnings(agentId, await toUsd(amount, currency));
  }

  // 6. Update enrollment status to PAID
  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: { status: "PAID" },
  });

  // 7. Fetch details and send confirmation email asynchronously
  const [studentData, courseData, enrollmentData] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      select: { name: true, email: true, phone: true, country: true },
    }),
    courseId
      ? prisma.course.findUnique({
          where: { id: courseId },
          select: { name: true, description: true },
        })
      : null,
    prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        batch: { select: { name: true, whatsappGroupUrl: true } },
      },
    }),
  ]);

  if (studentData?.email && courseData?.name) {
    const currencySymbolMap: Record<string, string> = {
      USD: "$", INR: "₹", EUR: "€", GBP: "£", AED: "د.إ",
    };
    sendEnrollmentConfirmationEmail({
      studentName: studentData.name,
      studentEmail: studentData.email,
      courseName: courseData.name,
      amount,
      currency,
      currencySymbol: currencySymbolMap[currency.toUpperCase()] ?? currency,
      razorpayPaymentId,
      paidAt: payment.createdAt,
      batchName: enrollmentData?.batch?.name ?? null,
      whatsappGroupUrl: enrollmentData?.batch?.whatsappGroupUrl ?? null,
    }).catch((err) => console.error("[Email] Failed to send enrollment email:", err));
  }

  return {
    success: true,
    alreadyProcessed: false,
    payment,
    student: studentData,
    course: courseData,
  };
}
