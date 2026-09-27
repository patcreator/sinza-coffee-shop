import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "sinza-coffee-dev-secret-change-me-please-01234",
);
export const SESSION_COOKIE = "sinza_session";

export type SessionUser = {
  id: number;
  email: string;
  name: string | null;
  role: string;
};

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function readSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: Number(payload.id),
      email: String(payload.email),
      name: (payload.name as string) ?? null,
      role: String(payload.role || "customer"),
    };
  } catch {
    return null;
  }
}

export async function requireRole(roles: string[]) {
  const session = await readSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}

export async function upsertUser(email: string, name?: string | null) {
  const normalized = email.trim().toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  if (existing.length) return existing[0];
  const adminList = (process.env.ADMIN_EMAILS || "admin@sinzacoffee.rw")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const role = adminList.includes(normalized) ? "admin" : "customer";
  const inserted = await db
    .insert(users)
    .values({ email: normalized, name: name ?? null, role, activated: false })
    .returning();
  return inserted[0];
}
