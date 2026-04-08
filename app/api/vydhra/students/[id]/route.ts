import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getStudentById } from "@/lib/student";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const student = await getStudentById(id as string);
  
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
});
