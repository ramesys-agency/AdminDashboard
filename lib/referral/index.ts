import prisma from "@/lib/prisma";
import { ReferralSettings, Student } from "@prisma/client";

export type RateType = "PERCENTAGE" | "FLAT";

async function getVydhraBusinessId() {
  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });
  if (!vydhra) throw new Error("Vydhra business not found");
  return vydhra.id;
}

/**
 * Returns the referral settings row for the Vydhra business,
 * creating it with schema defaults on first access.
 */
export async function getReferralSettings(): Promise<ReferralSettings> {
  const businessId = await getVydhraBusinessId();
  return prisma.referralSettings.upsert({
    where: { businessId },
    update: {},
    create: { businessId },
  });
}

export type UpdateReferralSettingsInput = Partial<{
  studentReferralEnabled: boolean;
  studentDiscountType: RateType;
  studentDiscountValue: number;
  studentCommissionType: RateType;
  studentCommissionValue: number;
  agentDiscountType: RateType;
  agentDiscountValue: number;
  agentCommissionType: RateType;
  agentCommissionValue: number;
  updatedBy: string;
}>;

export async function updateReferralSettings(data: UpdateReferralSettingsInput) {
  const valueFields = [
    "studentDiscountValue",
    "studentCommissionValue",
    "agentDiscountValue",
    "agentCommissionValue",
  ] as const;

  for (const field of valueFields) {
    const value = data[field];
    if (value === undefined) continue;
    if (typeof value !== "number" || isNaN(value) || value < 0) {
      throw new Error(`${field} must be a non-negative number`);
    }
    const typeField = field.replace("Value", "Type") as keyof UpdateReferralSettingsInput;
    if ((data[typeField] ?? "PERCENTAGE") === "PERCENTAGE" && value > 100) {
      throw new Error(`${field} cannot exceed 100%`);
    }
  }

  const settings = await getReferralSettings();
  return prisma.referralSettings.update({
    where: { id: settings.id },
    data,
  });
}

/** Characters that are easy to read out loud (no 0/O, 1/I/L). */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCodeSuffix(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/**
 * Referral codes share a single namespace with coupon and agent codes
 * (checkout resolves coupons first, so a collision would shadow the code).
 */
async function isCodeTaken(code: string) {
  const [student, coupon, agent] = await Promise.all([
    prisma.student.findUnique({ where: { referralCode: code }, select: { id: true } }),
    prisma.coupon.findUnique({ where: { code }, select: { id: true } }),
    prisma.agent.findUnique({ where: { code }, select: { id: true } }),
  ]);
  return !!(student || coupon || agent);
}

/**
 * Generates a unique referral code for a student (e.g. "PRIYA-7XK2")
 * and persists it. Returns the existing code if one is already set.
 */
export async function ensureStudentReferralCode(studentId: string): Promise<string> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { referralCode: true, name: true },
  });
  if (!student) throw new Error("Student not found");
  if (student.referralCode) return student.referralCode;

  const prefix =
    (student.name || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "REF";

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `${prefix}-${randomCodeSuffix(4)}`;
    if (await isCodeTaken(code)) continue;
    try {
      await prisma.student.update({
        where: { id: studentId },
        data: { referralCode: code },
      });
      return code;
    } catch {
      // Unique constraint race — retry with a new suffix
    }
  }
  throw new Error("Could not generate a unique referral code");
}

export type ResolvedStudentReferral = {
  student: Pick<Student, "id" | "name" | "email" | "referralCode">;
  discountType: RateType;
  discountValue: number;
};

/**
 * Resolves a code as a student referral code. Returns null when the code
 * doesn't match a student or the program is disabled. Discount falls back
 * to the configured defaults when the student has no override.
 * FLAT discount values are denominated in USD.
 */
export async function resolveStudentReferral(
  code: string,
): Promise<ResolvedStudentReferral | null> {
  const normalized = code.toUpperCase().trim();
  if (!normalized) return null;

  const settings = await getReferralSettings();
  if (!settings.studentReferralEnabled) return null;

  const student = await prisma.student.findUnique({
    where: { referralCode: normalized },
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
      discountType: true,
      discountValue: true,
    },
  });
  if (!student) return null;

  return {
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      referralCode: student.referralCode,
    },
    discountType: student.discountType ?? settings.studentDiscountType,
    discountValue: student.discountValue ?? settings.studentDiscountValue,
  };
}

/**
 * Credits referral commission to a student for a completed payment.
 * `paymentAmountUsd` must already be converted to USD — student earnings
 * are tracked in USD, mirroring agent earnings.
 * Returns the credit details so callers can notify the referrer.
 */
export async function incrementStudentReferralEarnings(
  referrerStudentId: string,
  paymentAmountUsd: number,
) {
  const [student, settings] = await Promise.all([
    prisma.student.findUnique({
      where: { id: referrerStudentId },
      select: {
        name: true,
        email: true,
        referralCode: true,
        commissionType: true,
        commissionValue: true,
      },
    }),
    getReferralSettings(),
  ]);
  if (!student) return null;

  const commissionType = student.commissionType ?? settings.studentCommissionType;
  const commissionValue = student.commissionValue ?? settings.studentCommissionValue;

  const commission =
    commissionType === "PERCENTAGE"
      ? (paymentAmountUsd * (commissionValue || 0)) / 100
      : commissionValue || 0;

  const updated = await prisma.student.update({
    where: { id: referrerStudentId },
    data: { totalEarned: { increment: commission } },
    select: { totalEarned: true },
  });

  return {
    commission,
    totalEarned: updated.totalEarned,
    name: student.name,
    email: student.email,
    code: student.referralCode,
  };
}

export async function updateStudentReferralStats(
  id: string,
  data: {
    totalPaid?: { increment: number };
    additionalAmount?: number;
    discountType?: RateType | null;
    discountValue?: number | null;
    commissionType?: RateType | null;
    commissionValue?: number | null;
  },
) {
  const student = await prisma.student.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!student) throw new Error("Student not found");

  return prisma.student.update({
    where: { id },
    data,
  });
}
