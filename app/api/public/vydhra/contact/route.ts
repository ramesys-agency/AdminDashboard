import { NextResponse } from "next/server";
import { createEnquiry } from "@/lib/enquiry";
import { sendContactNotificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Save enquiry to DB
    const enquiry = await createEnquiry({ name, email, phone, message });

    // Send notification email to info@vydhra.com (non-blocking)
    sendContactNotificationEmail({
      name,
      email,
      phone,
      message,
      submittedAt: new Date(),
    }).catch((err) => console.error("[Email] Failed to send contact notification:", err));

    return NextResponse.json({ success: true, enquiryId: enquiry.id });
  } catch (error: unknown) {
    console.error("[PUBLIC /contact] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
