import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getProjectById } from "@/lib/project";

export const GET = withAuth(async (req, context) => {
  const { id } = await context.params;
  const project = await getProjectById(id as string);
  
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  
  return NextResponse.json(project);
});
