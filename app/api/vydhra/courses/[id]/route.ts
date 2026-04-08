import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getCourseById } from "@/lib/course";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const course = await getCourseById(id as string);
  
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
});
