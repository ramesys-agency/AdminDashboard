import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getProjects } from "@/lib/project";

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("q") || undefined;
  const status = searchParams.get("status") || undefined;
  const clientId = searchParams.get("clientId") || undefined;

  const result = await getProjects({ page, limit, search, status, clientId });
  return NextResponse.json(result);
});
