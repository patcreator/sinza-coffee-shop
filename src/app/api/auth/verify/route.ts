import { NextResponse } from "next/server";
import { db } from "@/db";
import { loginTokens, users } from "@/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { SESSION_COOKIE, createSessionToken, upsertUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token") ?? "";
  const rows = await db
    .select()
    .from(loginTokens)
    .where(and(eq(loginTokens.token, token), isNull(loginTokens.usedAt), gt(loginTokens.expiresAt, new Date())))
    .limit(1);

  if (!rows.length) {
    return NextResponse.redirect(`${origin}/sign-in?error=expired`);
  }

  const user = await upsertUser(rows[0].email);
  await db.update(loginTokens).set({ usedAt: new Date() }).where(eq(loginTokens.id, rows[0].id));
  await db.update(users).set({ activated: true }).where(eq(users.id, user.id));

  const jwt = await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  const res = NextResponse.redirect(`${origin}/account?welcome=1`);
  res.cookies.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
