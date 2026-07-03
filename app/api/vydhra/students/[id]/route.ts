import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getStudentById } from "@/lib/student";
import { updateStudentReferralStats, RateType } from "@/lib/referral";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const student = await getStudentById(id as string);

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
});

export const PATCH = withAuth(async (req, { params }) => {
  const { id } = await params;
  const {
    additionalAmount,
    bonusAmount,
    commissionType,
    commissionValue,
    discountType,
    discountValue,
  } = await req.json();

  const hasUpdate = [
    additionalAmount,
    bonusAmount,
    commissionType,
    commissionValue,
    discountType,
    discountValue,
  ].some((v) => v !== undefined);

  if (!hasUpdate) {
    return NextResponse.json({ error: "Missing update data" }, { status: 400 });
  }

  try {
    const updatedStudent = await updateStudentReferralStats(id as string, {
      // Mirrors the agent payout API: additionalAmount records a payout,
      // bonusAmount sets the manual bonus
      ...(additionalAmount !== undefined && { totalPaid: { increment: additionalAmount } }),
      ...(bonusAmount !== undefined && { additionalAmount: bonusAmount }),
      // Referral overrides — pass null to fall back to the global defaults
      ...(commissionType !== undefined && { commissionType: commissionType as RateType | null }),
      ...(commissionValue !== undefined && { commissionValue }),
      ...(discountType !== undefined && { discountType: discountType as RateType | null }),
      ...(discountValue !== undefined && { discountValue }),
    });
    return NextResponse.json(updatedStudent);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
});
