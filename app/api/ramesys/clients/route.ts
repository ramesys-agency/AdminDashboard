import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getClients } from "@/lib/client";

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("q") || undefined;

  const result = await getClients({ page, limit, search });
  return NextResponse.json(result);
});
