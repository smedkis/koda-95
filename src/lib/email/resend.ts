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
// registration. Missing API key or a Resend error is logged and returns
// false so callers that need to know (e.g. bulk sends) can track failures.
export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.error(`RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
    return false;
  }

  const from = process.env.EMAIL_FROM;
  if (!from) {
    console.error(`EMAIL_FROM not set — skipping email "${subject}" to ${to}`);
    return false;
  }

  try {
    const { error } = await resend.emails.send({ from, to, subject, html, attachments });
    if (error) {
      console.error(`Failed to send email "${subject}" to ${to}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed to send email "${subject}" to ${to}:`, err);
    return false;
  }
}
