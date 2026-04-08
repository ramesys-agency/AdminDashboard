import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getInvoiceById } from "@/lib/invoice";

export const GET = withAuth(async (req, context) => {
  const { id } = await context.params;
  const invoice = await getInvoiceById(id);
  
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  
  return NextResponse.json(invoice);
});
