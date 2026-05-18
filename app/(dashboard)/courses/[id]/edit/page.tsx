"use client";

import { use } from "react";
import { CourseForm } from "@/components/courses/CourseForm";

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CourseForm mode="edit" courseId={id} />;
}
