import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages, feedback, reservations, subscribers } from "@/db/schema";
import { baseTemplate, sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** One endpoint for reservation / contact / newsletter / feedback submissions. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const kind = String(body.kind || "");
  const site = await getSettings();

  try {
    if (kind === "reservation") {
      if (!body.name || !body.phone || !body.date || !body.time) {
        return NextResponse.json({ error: "Name, phone, date and time are required." }, { status: 400 });
      }
      const [row] = await db
        .insert(reservations)
        .values({
          name: body.name,
          email: body.email ?? null,
          phone: body.phone,
          date: body.date,
          time: body.time,
          guests: Number(body.guests) || 2,
          note: body.note ?? null,
        })
        .returning();
      if (body.email) {
        await sendEmail({
          to: body.email,
          subject: "Your table request at Sinza Coffee Shop",
          html: baseTemplate(
            "We received your reservation",
            `<p>Hi ${body.name}, we have your request for <strong>${body.guests || 2} guest(s)</strong> on <strong>${body.date} at ${body.time}</strong>.</p><p>Our team will confirm shortly. ${site.address}</p>`,
          ),
        });
      }
      return NextResponse.json({ ok: true, reservation: row }, { status: 201 });
    }

    if (kind === "contact") {
      if (!body.name || !body.email || !body.message) {
        return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
      }
      const [row] = await db
        .insert(contactMessages)
        .values({
          name: body.name,
          email: body.email,
          subject: body.subject ?? "Website contact",
          message: body.message,
        })
        .returning();
      await sendEmail({
        to: body.email,
        subject: "Thanks for writing to Sinza Coffee Shop",
        html: baseTemplate(
          "We got your message",
          `<p>Hi ${body.name}, thank you for reaching out. We reply within one working day.</p><blockquote style="border-left:3px solid #923F0C;padding-left:12px;color:#5b4435">${body.message}</blockquote>`,
        ),
      });
      return NextResponse.json({ ok: true, message: row }, { status: 201 });
    }

    if (kind === "newsletter") {
      if (!body.email) return NextResponse.json({ error: "Email is required." }, { status: 400 });
      const [row] = await db
        .insert(subscribers)
        .values({
          email: String(body.email).toLowerCase(),
          name: body.name ?? null,
          frequency: body.frequency === "daily" ? "daily" : "weekly",
        })
        .onConflictDoUpdate({
          target: subscribers.email,
          set: { active: true, frequency: body.frequency === "daily" ? "daily" : "weekly" },
        })
        .returning();
      await sendEmail({
        to: row.email,
        subject: "You're on the Sinza list ☕",
        html: baseTemplate(
          "Welcome to the Sinza newsletter",
          `<p>You'll get our ${row.frequency} menu drops, offers and event news straight to your inbox.</p>`,
          { label: "Browse the menu", url: "/menu" },
        ),
      });
      return NextResponse.json({ ok: true, subscriber: row }, { status: 201 });
    }

    if (kind === "feedback") {
      const [row] = await db
        .insert(feedback)
        .values({
          name: body.name ?? null,
          email: body.email ?? null,
          rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
          message: body.message ?? null,
        })
        .returning();
      return NextResponse.json({ ok: true, feedback: row }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown form type" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save your submission" },
      { status: 500 },
    );
  }
}
