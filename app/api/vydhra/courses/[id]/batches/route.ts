import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getBatchesByCourseId, createBatch } from "@/lib/batch";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const batches = await getBatchesByCourseId(id as string);
  return NextResponse.json(batches);
});

export const POST = withAuth(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const { name, startDate, endDate, maxSeats, pricing = [], status, whatsappGroupUrl } = body;

  if (!name || !startDate || !endDate) {
    return NextResponse.json(
      { error: "name, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  const batch = await createBatch({
    courseId: id as string,
    name,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    maxSeats: maxSeats ?? null,
    pricing,
    status,
    whatsappGroupUrl: whatsappGroupUrl || null,
  });

  return NextResponse.json(batch, { status: 201 });
});
