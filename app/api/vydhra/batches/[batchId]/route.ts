import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getBatchDetails } from "@/lib/batch";

export const GET = withAuth(async (req, { params }) => {
  const { batchId } = await params;
  const batch = await getBatchDetails(batchId as string);
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  return NextResponse.json(batch);
});
