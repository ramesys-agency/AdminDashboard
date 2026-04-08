import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getInvoices } from "@/lib/invoice";

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("q") || undefined;
  const status = searchParams.get("status") || undefined;

  const result = await getInvoices({ page, limit, search, status, businessType: "COURSE_SELLING" });
  return NextResponse.json(result);
});
