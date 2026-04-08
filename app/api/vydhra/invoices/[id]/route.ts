import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getInvoiceById } from "@/lib/invoice";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const invoice = await getInvoiceById(id as string);
  
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(invoice);
});
