import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getAgentById, updateAgentStatistics } from "@/lib/agent";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const agent = await getAgentById(id as string);
  
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json(agent);
});

export const PATCH = withAuth(async (req, { params }) => {
  const { id } = await params;
  const { additionalAmount, bonusAmount } = await req.json();

  if (additionalAmount === undefined && bonusAmount === undefined) {
    return NextResponse.json({ error: "Missing update data" }, { status: 400 });
  }

  try {
    const updatedAgent = await updateAgentStatistics(id as string, {
      ...(additionalAmount !== undefined && { totalPaid: { increment: additionalAmount } }),
      ...(bonusAmount !== undefined && { additionalAmount: bonusAmount })
    });
    return NextResponse.json(updatedAgent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
});
