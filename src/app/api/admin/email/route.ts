import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs, posts, subscribers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/session";
import { baseTemplate, sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const staff = await requireRole(["admin", "editor"]);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(200);
  return NextResponse.json({ rows });
}

export async function POST(request: Request) {
  const staff = await requireRole(["admin", "editor"]);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const subject = String(body.subject || "").trim();
  const html = String(body.html || "");
  if (!subject || !html) return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });

  let recipients: string[] = [];
  if (body.audience === "subscribers") {
    const rows = await db.select().from(subscribers).where(eq(subscribers.active, true));
    recipients = rows.map((r) => r.email);
  } else if (Array.isArray(body.to)) {
    recipients = body.to.map(String);
  } else if (body.to) {
    recipients = [String(body.to)];
  }
  if (!recipients.length) return NextResponse.json({ error: "No recipients." }, { status: 400 });

  const wrapped = baseTemplate(subject, html, body.ctaUrl ? { label: body.ctaLabel || "Read more", url: body.ctaUrl } : undefined);
  const results = [];
  for (const to of recipients.slice(0, 500)) {
    results.push({ to, ...(await sendEmail({ to, subject, html: wrapped, templateId: body.templateId ?? null })) });
  }

  if (body.postId) {
    await db.update(posts).set({ notified: true }).where(eq(posts.id, Number(body.postId)));
  }

  return NextResponse.json({ sent: results.length, results });
}
