import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EnrollmentEmailData {
  studentName: string;
  studentEmail: string;
  courseName: string;
  amount: number;
  currency: string;
  currencySymbol: string;
  razorpayPaymentId: string;
  paidAt: Date;
  whatsappGroupUrl?: string | null;
  batchName?: string | null;
}

function currencySymbolFor(currency: string): string {
  const map: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£", AED: "د.إ" };
  return map[currency.toUpperCase()] ?? currency;
}

export async function sendEnrollmentConfirmationEmail(data: EnrollmentEmailData) {
  const symbol = data.currencySymbol || currencySymbolFor(data.currency);
  const paidDate = new Date(data.paidAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const resolvedWhatsappUrl = data.whatsappGroupUrl || process.env.WHATSAPP_GROUP_URL || null;
  const whatsappSection = resolvedWhatsappUrl
    ? `
      <tr>
        <td style="padding: 24px 32px; background: #f0fdf4; border-top: 1px solid #dcfce7;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 0.08em;">Join Your Batch Community</p>
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151;">Connect with your batchmates and get course updates on WhatsApp.</p>
                <a href="${resolvedWhatsappUrl}" style="display: inline-block; background: #25d366; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px;">
                  Join WhatsApp Group →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const batchRow = data.batchName
    ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="font-size: 13px; color: #6b7280; font-weight: 500;">Batch</span></td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right;"><span style="font-size: 13px; color: #111827; font-weight: 600;">${data.batchName}</span></td></tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Enrollment Confirmed – Vydhra</title>
</head>
<body style="margin: 0; padding: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">VYDHRA</p>
              <div style="display: inline-block; background: rgba(255,255,255,0.2); border-radius: 100px; padding: 6px 20px; margin-top: 8px;">
                <p style="margin: 0; font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.1em;">✓ Enrollment Confirmed</p>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background: #ffffff; padding: 40px 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 26px; font-weight: 800; color: #111827;">You're enrolled, ${data.studentName}! 🎉</h1>
              <p style="margin: 0 0 32px 0; font-size: 15px; color: #6b7280; line-height: 1.6;">
                Your payment was successful and your spot in <strong style="color: #111827;">${data.courseName}</strong> is confirmed. We're excited to have you on board!
              </p>

              <!-- Order Details -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">Order Details</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="font-size: 13px; color: #6b7280; font-weight: 500;">Course</span></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right;"><span style="font-size: 13px; color: #111827; font-weight: 600;">${data.courseName}</span></td>
                  </tr>
                  ${batchRow}
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="font-size: 13px; color: #6b7280; font-weight: 500;">Payment Date</span></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right;"><span style="font-size: 13px; color: #111827; font-weight: 600;">${paidDate}</span></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="font-size: 13px; color: #6b7280; font-weight: 500;">Payment ID</span></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right;"><span style="font-size: 12px; color: #6b7280; font-family: monospace;">${data.razorpayPaymentId}</span></td>
                  </tr>
                  <tr>
                    <td style="padding: 14px 0 0 0;"><span style="font-size: 14px; color: #111827; font-weight: 700;">Amount Paid</span></td>
                    <td style="padding: 14px 0 0 0; text-align: right;"><span style="font-size: 22px; color: #ea580c; font-weight: 900;">${symbol}${data.amount.toLocaleString("en-US")}</span></td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                If you have any questions, reply to this email or reach us at
                <a href="mailto:support@vydhra.com" style="color: #ea580c; font-weight: 600; text-decoration: none;">support@vydhra.com</a>.
              </p>
            </td>
          </tr>

          <!-- WhatsApp Section -->
          ${whatsappSection}

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} Vydhra. All rights reserved.</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">Keep this email as proof of your enrollment.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Vydhra" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: data.studentEmail,
    subject: `You're enrolled in ${data.courseName} – Vydhra`,
    html,
  });
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  submittedAt: Date;
}

export async function sendContactNotificationEmail(data: ContactEmailData) {
  const submittedAt = new Date(data.submittedAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Enquiry – Vydhra</title>
</head>
<body style="margin: 0; padding: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">VYDHRA</p>
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 0.08em;">New Contact Enquiry</p>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; padding: 40px 32px;">
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                Someone submitted the contact form on <strong>vydhra.com</strong>. Here are the details:
              </p>
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; width: 35%;"><span style="font-size: 13px; color: #6b7280; font-weight: 500;">Name</span></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="font-size: 13px; color: #111827; font-weight: 600;">${data.name}</span></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="font-size: 13px; color: #6b7280; font-weight: 500;">Email</span></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><a href="mailto:${data.email}" style="font-size: 13px; color: #ea580c; font-weight: 600; text-decoration: none;">${data.email}</a></td>
                  </tr>
                  ${data.phone ? `<tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="font-size: 13px; color: #6b7280; font-weight: 500;">Phone</span></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><span style="font-size: 13px; color: #111827; font-weight: 600;">${data.phone}</span></td>
                  </tr>` : ""}
                  <tr>
                    <td style="padding: 10px 0;"><span style="font-size: 13px; color: #6b7280; font-weight: 500;">Submitted</span></td>
                    <td style="padding: 10px 0;"><span style="font-size: 13px; color: #111827; font-weight: 600;">${submittedAt}</span></td>
                  </tr>
                </table>
              </div>
              <div style="background: #fff7ed; border-left: 4px solid #ea580c; border-radius: 0 8px 8px 0; padding: 16px 20px;">
                <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.08em;">Message</p>
                <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.7;">${data.message.replace(/\n/g, "<br/>")}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #f9fafb; border-radius: 0 0 16px 16px; padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">This is an automated notification from vydhra.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Vydhra Contact Form" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: "info@vydhra.com",
    replyTo: data.email,
    subject: `New Enquiry from ${data.name} – Vydhra Contact Form`,
    html,
  });
}
