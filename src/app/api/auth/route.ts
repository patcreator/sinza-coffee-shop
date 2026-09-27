import { NextResponse } from "next/server";
import { db } from "@/db";
import { loginTokens, users } from "@/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { SESSION_COOKIE, createSessionToken, readSession, upsertUser } from "@/lib/session";
import { baseTemplate, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession();
  return NextResponse.json({ user: session });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "request-link");

  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
    return res;
  }

  if (action === "request-link") {
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    const user = await upsertUser(email, body.name ?? null);
    const token = nanoid(40);
    await db.insert(loginTokens).values({
      email,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    });
    const link = `${SITE_URL}/api/auth/verify?token=${token}`;
    const result = await sendEmail({
      to: email,
      subject: "Activate your Sinza Coffee Shop account",
      html: baseTemplate(
        "Activate your account",
        `<p>Hi ${user.name || "there"}, click the button below to activate your account and sign in. The link expires in 30 minutes.</p>`,
        { label: "Activate & sign in", url: link },
      ),
    });
    return NextResponse.json({
      ok: true,
      emailStatus: result.status,
      // In dev (no Resend key) we return the link so the flow stays testable.
      devLink: result.status === "skipped" ? link : undefined,
    });
  }

  if (action === "verify") {
    const token = String(body.token || "");
    const rows = await db
      .select()
      .from(loginTokens)
      .where(and(eq(loginTokens.token, token), isNull(loginTokens.usedAt), gt(loginTokens.expiresAt, new Date())))
      .limit(1);
    if (!rows.length) return NextResponse.json({ error: "Link expired or already used." }, { status: 400 });
    const user = await upsertUser(rows[0].email);
    await db.update(loginTokens).set({ usedAt: new Date() }).where(eq(loginTokens.id, rows[0].id));
    await db.update(users).set({ activated: true }).where(eq(users.id, user.id));
    const jwt = await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    const res = NextResponse.json({ ok: true, user: { ...user, activated: true } });
    res.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
