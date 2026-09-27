import { db } from "@/db";
import { emailLogs } from "@/db/schema";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  templateId?: number | null;
};

export async function sendEmail({ to, subject, html, templateId }: SendArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Sinza Coffee Shop <onboarding@resend.dev>";
  let status = "sent";
  let error: string | null = null;

  if (!apiKey) {
    status = "skipped";
    error = "RESEND_API_KEY not configured — email logged only.";
    console.info(`[email:dev] to=${to} subject=${subject}`);
  } else {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({ from, to, subject, html });
      if (result.error) {
        status = "failed";
        error = result.error.message;
      }
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : "unknown error";
    }
  }

  try {
    await db.insert(emailLogs).values({
      toAddress: to,
      subject,
      html,
      status,
      error,
      templateId: templateId ?? null,
    });
  } catch {
    /* logging must never break the request */
  }

  return { status, error };
}

export function baseTemplate(title: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#F7F0EB;font-family:Helvetica,Arial,sans-serif;color:#2C150A">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F0EB;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FBFBEC;border-radius:16px;overflow:hidden;border:1px solid #e6d9cd">
        <tr><td style="background:#35180B;padding:22px 26px;color:#F7F0EB;font-size:20px;font-weight:700">☕ Sinza Coffee Shop</td></tr>
        <tr><td style="padding:26px">
          <h1 style="margin:0 0 12px;font-size:22px;color:#35180B">${title}</h1>
          <div style="font-size:15px;line-height:1.6;color:#2C150A">${body}</div>
          ${
            cta
              ? `<p style="margin:26px 0 0"><a href="${cta.url}" style="background:#923F0C;color:#FBFBEC;text-decoration:none;padding:12px 22px;border-radius:999px;display:inline-block;font-weight:600">${cta.label}</a></p>`
              : ""
          }
        </td></tr>
        <tr><td style="padding:18px 26px;background:#35180B;color:#F7F0EB;font-size:12px">
          Gisozi (Kwa Gakire), Kigali · Coffee, Meals ✨
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}
