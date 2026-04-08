import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getStudents } from "@/lib/student";

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("q") || undefined;

  const result = await getStudents({ page, limit, search });
  return NextResponse.json(result);
});
