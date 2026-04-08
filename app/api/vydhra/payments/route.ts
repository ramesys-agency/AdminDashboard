import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getPayments } from "@/lib/payment";

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status") || undefined;
  const method = searchParams.get("method") || undefined;

  const result = await getPayments({ page, limit, status, method });
  return NextResponse.json(result);
});
