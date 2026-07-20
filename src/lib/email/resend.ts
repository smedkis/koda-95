import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client ??= new Resend(apiKey);
  return client;
}

export type EmailAttachment = { filename: string; content: string; contentId?: string };

// Never throws — a failed/unconfigured email send should never take down a
// registration. Missing API key or a Resend error is logged and swallowed.
export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.error(`RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
    return;
  }

  const from = process.env.EMAIL_FROM;
  if (!from) {
    console.error(`EMAIL_FROM not set — skipping email "${subject}" to ${to}`);
    return;
  }

  try {
    const { error } = await resend.emails.send({ from, to, subject, html, attachments });
    if (error) {
      console.error(`Failed to send email "${subject}" to ${to}:`, error);
    }
  } catch (err) {
    console.error(`Failed to send email "${subject}" to ${to}:`, err);
  }
}
