import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getEnquiryById } from "@/lib/enquiry";

export const GET = withAuth(async (req, context) => {
  const { id } = await context.params;
  const enquiry = await getEnquiryById(id);
  
  if (!enquiry) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }
  
  return NextResponse.json(enquiry);
});
