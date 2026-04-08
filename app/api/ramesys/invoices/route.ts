import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getInvoices } from "@/lib/invoice";

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status") || undefined;
  const projectId = searchParams.get("projectId") || undefined;

  const result = await getInvoices({ page, limit, status, projectId, businessType: "IT_SERVICES" });
  return NextResponse.json(result);
});
