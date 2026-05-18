import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getCourseById, updateCourse } from "@/lib/course";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const course = await getCourseById(id as string);

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
});

export const PUT = withAuth(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const course = await updateCourse(id as string, body);
  return NextResponse.json(course);
});
