import prisma, { TransactionClient } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendEnrollmentConfirmationEmail, sendReferralEarningEmail } from "@/lib/email";
import { getUsdToInrRate } from "@/lib/exchange";
import { getVydhraBusinessId } from "@/lib/business";

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
import {
  incrementStudentReferralEarnings,
  ensureStudentReferralCode,
  getReferralSettings,
} from "@/lib/referral";

// FLAT referral rates are denominated in USD (see lib/referral).
function formatReferralRate(type: "PERCENTAGE" | "FLAT", value: number): string {
  return type === "PERCENTAGE" ? `${value}%` : `$${value}`;
}

type EarningCredit = {
  commission: number;
  totalEarned: number;
  name: string;
  email: string;
  code: string | null;
  recipientType: "agent" | "student";
};

/**
 * Fire-and-forget referral earning notifications to the agent and/or
 * referring student credited for a completed payment. Never throws —
 * email failures must not break payment processing.
 */
function notifyReferralEarnings(params: {
  credits: Array<EarningCredit | null>;
  buyerName: string | null | undefined;
  courseName: string | null | undefined;
  saleAmount: number;
  saleCurrency: string;
  paidAt: Date;
}) {
  for (const credit of params.credits) {
    if (!credit || !credit.email || credit.commission <= 0) continue;
    sendReferralEarningEmail({
      recipientName: credit.name,
      recipientEmail: credit.email,
      recipientType: credit.recipientType,
      referralCode: credit.code ?? "—",
      buyerName: params.buyerName || "A student",
      courseName: params.courseName || "a Vydhra course",
      saleAmount: params.saleAmount,
      saleCurrency: params.saleCurrency,
      earningAmount: credit.commission,
      totalEarned: credit.totalEarned,
      paidAt: params.paidAt,
    }).catch((err) =>
      console.error("[Email] Failed to send referral earning email:", err),
    );
  }
}

export async function updatePaymentStatus(id: string, status: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    select: {
      agentId: true,
      referrerStudentId: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
      student: { select: { name: true } },
      courseEnrollment: { select: { course: { select: { name: true } } } },
    }
  });

  if (!payment) throw new Error("Payment not found");

  // If status is being changed to COMPLETED and it was not COMPLETED before
  if (status === "COMPLETED" && payment.status !== "COMPLETED") {
    const amountUsd = await toUsd(payment.amount, payment.currency ?? "USD");

    // Credits and the status flip are atomic — a crash can't leave a
    // COMPLETED payment with uncredited commission (or vice versa).
    const { updated, agentCredit, studentCredit } = await prisma.$transaction(async (tx) => {
      let agentCredit = null;
      let studentCredit = null;
      if (payment.agentId) {
        agentCredit = await incrementAgentEarnings(payment.agentId, amountUsd, {
          tx,
          paymentId: id,
        });
      }
      if (payment.referrerStudentId) {
        studentCredit = await incrementStudentReferralEarnings(
          payment.referrerStudentId,
          amountUsd,
          { tx, paymentId: id },
        );
      }
      const updated = await tx.payment.update({ where: { id }, data: { status } });
      return { updated, agentCredit, studentCredit };
    });

    notifyReferralEarnings({
      credits: [
        agentCredit && { ...agentCredit, recipientType: "agent" as const },
        studentCredit && { ...studentCredit, recipientType: "student" as const },
      ],
      buyerName: payment.student?.name,
      courseName: payment.courseEnrollment?.course?.name,
      saleAmount: payment.amount,
      saleCurrency: payment.currency ?? "USD",
      paidAt: payment.createdAt,
    });

    return updated;
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
  referrerStudentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  acceptedTerms?: boolean;
  acceptedTermsAt?: Date | null;
}, tx?: TransactionClient) {
  const businessId = await getVydhraBusinessId();

  const amount = Number(data.amount);
  const currency = (data.currency ?? "USD").toUpperCase();

  let exchangeRate = 1.0;
  let amountInINR = amount;

  if (currency === "USD") {
    // Cached with a 1h TTL — callers embedding this in a transaction should
    // pre-warm it (see completePaymentAndEnrollment) so no network call
    // happens inside the transaction.
    exchangeRate = await getUsdToInrRate();
    amountInINR = amount * exchangeRate;
  }

  const run = async (db: TransactionClient) => {
    // Create invoice first
    const invoice = await db.invoice.create({
      data: {
        businessId,
        amount,
        status: data.status === "COMPLETED" ? "PAID" : "PENDING",
        dueDate: new Date(),
      },
    });

    // Create payment linked to the invoice
    return db.payment.create({
      data: {
        businessId,
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
        referrerStudentId: data.referrerStudentId || null,
        razorpayOrderId: data.razorpayOrderId || null,
        razorpayPaymentId: data.razorpayPaymentId || null,
        razorpaySignature: data.razorpaySignature || null,
        acceptedTerms: data.acceptedTerms ?? false,
        acceptedTermsAt: data.acceptedTermsAt ?? null,
      },
    });
  };

  return tx ? run(tx) : prisma.$transaction(run);
}

export async function completePaymentAndEnrollment(params: {
  amount: number;
  currency: string;
  studentId: string;
  enrollmentId: string;
  courseId?: string | null;
  couponId?: string | null;
  referrerStudentId?: string | null;
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

  // 1. Prevent duplicate processing (fast path; the unique constraint on
  // razorpayPaymentId is the real guard — see the P2002 catch below)
  const existingPayment = await prisma.payment.findFirst({
    where: { razorpayPaymentId },
  });
  if (existingPayment) {
    return { success: true, alreadyProcessed: true, payment: existingPayment };
  }

  // 2. Resolve agentId if couponId is present
  let agentId: string | null = null;
  let couponMaxUses: number | null = null;
  if (couponId) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: { code: true, maxUses: true },
    });
    if (coupon) {
      couponMaxUses = coupon.maxUses;
      const agent = await prisma.agent.findUnique({
        where: { code: coupon.code },
        select: { id: true },
      });
      if (agent) {
        agentId = agent.id;
      }
    }
  }

  // Resolve the referring student (student referral program). Self-referrals
  // and unknown ids are dropped silently — the enrollment must still complete.
  let referrerStudentId: string | null = null;
  if (params.referrerStudentId && params.referrerStudentId !== studentId) {
    const referrer = await prisma.student.findUnique({
      where: { id: params.referrerStudentId },
      select: { id: true },
    });
    if (referrer) {
      referrerStudentId = referrer.id;
    }
  }

  // Pre-warm the FX cache and convert the sale amount before the transaction —
  // no network calls may happen inside it.
  await getUsdToInrRate();
  const amountUsd = await toUsd(amount, currency);

  // 3-6. Payment record, coupon usage, commission credits, and enrollment
  // status change happen in ONE transaction. The razorpayPaymentId unique
  // constraint is created together with the side effects it guards: a crash
  // rolls everything back and a retry re-runs the whole sequence, so a
  // COMPLETED payment can never exist with uncredited commission or a
  // PENDING enrollment. If the client's verify call and the Razorpay webhook
  // race, the loser's transaction aborts on P2002 — treat as already
  // processed (the winner did all the side effects).
  let payment;
  let agentCredit = null;
  let studentCredit = null;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const createdPayment = await createPayment({
        amount,
        currency,
        status: "COMPLETED",
        method,
        studentId,
        courseEnrollmentId: enrollmentId,
        couponId: couponId ?? undefined,
        agentId: agentId ?? undefined,
        referrerStudentId: referrerStudentId ?? undefined,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        acceptedTerms: true,
        acceptedTermsAt: new Date(),
      }, tx);

      // Coupon usage: the row-level WHERE makes the maxUses check-and-increment
      // atomic (the enroll-time check is only a fast-fail UX guard; N concurrent
      // payments could otherwise all pass it).
      let couponHonored = true;
      if (couponId) {
        const updated = await tx.coupon.updateMany({
          where: {
            id: couponId,
            ...(couponMaxUses !== null && { currentUses: { lt: couponMaxUses } }),
          },
          data: { currentUses: { increment: 1 } },
        });
        couponHonored = updated.count === 1;
      }

      // Commission credits (ledger row + derived aggregate, tracked in USD).
      // Over-limit coupon: the buyer already paid the discounted price, so we
      // honor the discount but withhold the agent's commission for this sale.
      let txAgentCredit = null;
      let txStudentCredit = null;
      if (agentId && couponHonored) {
        txAgentCredit = await incrementAgentEarnings(agentId, amountUsd, {
          tx,
          paymentId: createdPayment.id,
        });
      }
      if (referrerStudentId) {
        txStudentCredit = await incrementStudentReferralEarnings(
          referrerStudentId,
          amountUsd,
          { tx, paymentId: createdPayment.id },
        );
      }

      await tx.courseEnrollment.update({
        where: { id: enrollmentId },
        data: { status: "PAID" },
      });

      return { createdPayment, couponHonored, txAgentCredit, txStudentCredit };
    });

    payment = result.createdPayment;
    agentCredit = result.txAgentCredit;
    studentCredit = result.txStudentCredit;
    if (!result.couponHonored) {
      console.error(
        `[Payment] Coupon ${couponId} exceeded maxUses at payment time ` +
        `(payment ${razorpayPaymentId}) — discount honored, agent commission withheld.`,
      );
    }
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const winner = await prisma.payment.findFirst({ where: { razorpayPaymentId } });
      if (winner) {
        return { success: true, alreadyProcessed: true, payment: winner };
      }
    }
    throw err;
  }

  // 7. Fetch details and send confirmation email asynchronously
  const [studentData, courseById, enrollmentData] = await Promise.all([
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
        course: { select: { name: true, description: true } },
      },
    }),
  ]);

  // The enrollment always knows its course — never let a missing courseId in
  // the order notes silently drop the confirmation email (receipt + referral code).
  const courseData = courseById ?? enrollmentData?.course ?? null;

  // Enroll the buyer into the student referral program: generate their own
  // referral code so it can be shared in the confirmation email. Best-effort —
  // a failure here must never break payment processing.
  let buyerReferralCode: string | null = null;
  let referralDiscountText: string | null = null;
  let referralCommissionText: string | null = null;
  try {
    const settings = await getReferralSettings();
    if (settings.studentReferralEnabled) {
      buyerReferralCode = await ensureStudentReferralCode(studentId);
      referralDiscountText = formatReferralRate(
        settings.studentDiscountType,
        settings.studentDiscountValue,
      );
      referralCommissionText =
        settings.studentCommissionType === "PERCENTAGE"
          ? `${settings.studentCommissionValue}% of the course fee`
          : `$${settings.studentCommissionValue} per enrollment`;
    }
  } catch (err) {
    console.error("[Referral] Failed to generate buyer referral code:", err);
  }

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
      referralCode: buyerReferralCode,
      referralDiscountText,
      referralCommissionText,
    }).catch((err) => console.error("[Email] Failed to send enrollment email:", err));
  }

  // 8. Notify the agent / referring student about their earning
  notifyReferralEarnings({
    credits: [
      agentCredit && { ...agentCredit, recipientType: "agent" as const },
      studentCredit && { ...studentCredit, recipientType: "student" as const },
    ],
    buyerName: studentData?.name,
    courseName: courseData?.name,
    saleAmount: amount,
    saleCurrency: currency,
    paidAt: payment.createdAt,
  });

  return {
    success: true,
    alreadyProcessed: false,
    payment,
    student: studentData,
    course: courseData,
  };
}

/**
 * Unwinds the effects of a completed payment after a refund or a failed
 * capture (driven by Razorpay webhooks): payment + invoice status, enrollment
 * back to PENDING, coupon usage, and every EARNED commission credit (ledger
 * row flipped to REVERSED and the beneficiary's totalEarned decremented).
 * Idempotent — re-delivered webhooks are a no-op.
 */
export async function reversePaymentEffects(params: {
  razorpayPaymentId: string;
  newStatus: "REFUNDED" | "FAILED";
}) {
  const { razorpayPaymentId, newStatus } = params;

  const payment = await prisma.payment.findUnique({
    where: { razorpayPaymentId },
    include: { commissionCredits: true },
  });
  if (!payment) return { reversed: false, reason: "payment_not_found" as const };
  if (payment.status !== "COMPLETED") {
    // Already reversed (webhook redelivery) or never completed — nothing to unwind.
    return { reversed: false, reason: "not_completed" as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });

    if (payment.invoiceId) {
      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: newStatus === "REFUNDED" ? "REFUNDED" : "CANCELLED" },
      });
    }

    // Back to PENDING (not deleted): frees the batch seat — seat counting
    // only counts non-PENDING enrollments — while keeping the funnel record.
    if (payment.courseEnrollmentId) {
      await tx.courseEnrollment.update({
        where: { id: payment.courseEnrollmentId },
        data: { status: "PENDING" },
      });
    }

    if (payment.couponId) {
      await tx.coupon.updateMany({
        where: { id: payment.couponId, currentUses: { gt: 0 } },
        data: { currentUses: { decrement: 1 } },
      });
    }

    for (const credit of payment.commissionCredits) {
      if (credit.status !== "EARNED") continue;
      await tx.commissionCredit.update({
        where: { id: credit.id },
        data: { status: "REVERSED", reversedAt: new Date() },
      });
      if (credit.agentId) {
        await tx.agent.update({
          where: { id: credit.agentId },
          data: { totalEarned: { decrement: credit.amountUsd } },
        });
      }
      if (credit.referrerStudentId) {
        await tx.student.update({
          where: { id: credit.referrerStudentId },
          data: { totalEarned: { decrement: credit.amountUsd } },
        });
      }
    }
  });

  return { reversed: true as const };
}
