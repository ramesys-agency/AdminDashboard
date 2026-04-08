import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getAgents } from "@/lib/agent";

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("q") || undefined;

  const result = await getAgents({ page, limit, search });
  return NextResponse.json(result);
});
