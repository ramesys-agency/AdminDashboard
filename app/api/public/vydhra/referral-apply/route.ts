import { NextResponse } from "next/server";
import { createEnquiry } from "@/lib/enquiry";
import { sendAgentApplicationEmail } from "@/lib/email";

// Agent referral application from the Vydhra referrals page. Stored as an
// Enquiry (tagged in the message) and forwarded to the team — agents are
// onboarded manually from the admin dashboard.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, background } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and phone number are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const message = [
      "[AGENT REFERRAL APPLICATION]",
      background?.trim() ? `Industry background: ${background.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const enquiry = await createEnquiry({ name, email, phone, message });

    // Notify the team (non-blocking)
    sendAgentApplicationEmail({
      name,
      email,
      phone,
      background: background?.trim() || undefined,
      submittedAt: new Date(),
    }).catch((err) =>
      console.error("[Email] Failed to send agent application notification:", err)
    );

    return NextResponse.json({ success: true, applicationId: enquiry.id });
  } catch (error: unknown) {
    console.error("[PUBLIC /referral-apply] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
