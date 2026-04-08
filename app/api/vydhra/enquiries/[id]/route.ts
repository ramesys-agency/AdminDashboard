import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getEnquiryById } from "@/lib/enquiry";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const enquiry = await getEnquiryById(id as string);
  
  if (!enquiry) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }

  return NextResponse.json(enquiry);
});
