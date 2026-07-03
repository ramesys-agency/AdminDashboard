import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getReferralSettings, updateReferralSettings } from "@/lib/referral";

export const GET = withAuth(async () => {
  const settings = await getReferralSettings();
  return NextResponse.json(settings);
});

export const PATCH = withAuth(async (req) => {
  const body = await req.json();

  const allowedKeys = [
    "studentReferralEnabled",
    "studentDiscountType",
    "studentDiscountValue",
    "studentCommissionType",
    "studentCommissionValue",
    "agentDiscountType",
    "agentDiscountValue",
    "agentCommissionType",
    "agentCommissionValue",
  ] as const;

  const data = Object.fromEntries(
    Object.entries(body).filter(([key]) =>
      (allowedKeys as readonly string[]).includes(key),
    ),
  );

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid settings provided" }, { status: 400 });
  }

  try {
    const settings = await updateReferralSettings(data);
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
