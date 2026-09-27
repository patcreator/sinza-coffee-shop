import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders, waiters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const rows = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const order = rows[0];
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const waiter = order.waiterId
    ? (await db.select().from(waiters).where(eq(waiters.id, order.waiterId)).limit(1))[0]
    : null;
  return NextResponse.json({ order, items, waiter: waiter ?? null });
}

export async function PATCH(request: Request, ctx: { params: Promise<{ code: string }> }) {
  const staff = await requireRole(["admin", "editor"]);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { code } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = String(body.status);
  if (body.paymentStatus) patch.paymentStatus = String(body.paymentStatus);
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  const updated = await db.update(orders).set(patch).where(eq(orders.code, code)).returning();
  return NextResponse.json({ order: updated[0] ?? null });
}
