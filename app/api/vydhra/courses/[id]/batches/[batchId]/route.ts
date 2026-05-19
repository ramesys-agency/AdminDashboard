import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getBatchById, updateBatch, deleteBatch } from "@/lib/batch";

export const GET = withAuth(async (req, { params }) => {
  const { batchId } = await params;
  const batch = await getBatchById(batchId as string);
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  return NextResponse.json(batch);
});

export const PUT = withAuth(async (req, { params }) => {
  const { batchId } = await params;
  const body = await req.json();
  const { name, startDate, endDate, maxSeats, pricing, status, whatsappGroupUrl } = body;

  const batch = await updateBatch(batchId as string, {
    ...(name !== undefined && { name }),
    ...(startDate !== undefined && { startDate: new Date(startDate) }),
    ...(endDate !== undefined && { endDate: new Date(endDate) }),
    ...(maxSeats !== undefined && { maxSeats }),
    ...(pricing !== undefined && { pricing }),
    ...(status !== undefined && { status }),
    ...(whatsappGroupUrl !== undefined && { whatsappGroupUrl: whatsappGroupUrl || null }),
  });

  return NextResponse.json(batch);
});

export const DELETE = withAuth(async (req, { params }) => {
  const { batchId } = await params;
  await deleteBatch(batchId as string);
  return NextResponse.json({ success: true });
});
