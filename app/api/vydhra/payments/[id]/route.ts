import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getPaymentById } from "@/lib/payment";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const payment = await getPaymentById(id as string);
  
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json(payment);
});
