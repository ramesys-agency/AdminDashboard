import { NextResponse } from "next/server";
import { getReferralSettings } from "@/lib/referral";

// Public, read-only view of the referral program terms for the Vydhra
// referrals page. Exposes only the display-safe rate fields.
export async function GET() {
  try {
    const settings = await getReferralSettings();
    return NextResponse.json({
      studentReferralEnabled: settings.studentReferralEnabled,
      studentDiscountType: settings.studentDiscountType,
      studentDiscountValue: settings.studentDiscountValue,
      studentCommissionType: settings.studentCommissionType,
      studentCommissionValue: settings.studentCommissionValue,
      agentDiscountType: settings.agentDiscountType,
      agentDiscountValue: settings.agentDiscountValue,
      agentCommissionType: settings.agentCommissionType,
      agentCommissionValue: settings.agentCommissionValue,
    });
  } catch (error: unknown) {
    console.error("[PUBLIC /referral-program] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
