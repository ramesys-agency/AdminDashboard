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

import fs from "fs";
import path from "path";

export const PUT = withAuth(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  
  const logFile = path.join(process.cwd(), "payload-debug.log");
  fs.appendFileSync(
    logFile,
    `\n--- PUT REQUEST at ${new Date().toISOString()} for ID: ${id} ---\nBody:\n${JSON.stringify(body, null, 2)}\n`
  );

  const course = await updateCourse(id as string, body);

  fs.appendFileSync(
    logFile,
    `Result:\n${JSON.stringify(course, null, 2)}\n--------------------------------\n`
  );

  return NextResponse.json(course);
});
