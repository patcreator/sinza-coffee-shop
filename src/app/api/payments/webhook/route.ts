import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** PawaPay / Pesapal callback. Also used by the sandbox "mark as paid" action. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const reference = String(body.reference || body.OrderTrackingId || body.depositId || "");
  const rawStatus = String(body.status || body.payment_status_description || "COMPLETED").toUpperCase();
  if (!reference) return NextResponse.json({ error: "reference required" }, { status: 400 });

  const rows = await db.select().from(payments).where(eq(payments.reference, reference)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Unknown reference" }, { status: 404 });

  const paid = ["COMPLETED", "SUCCESS", "SUCCESSFUL", "PAID"].includes(rawStatus);
  const status = paid ? "paid" : rawStatus === "FAILED" ? "failed" : "pending";

  await db.update(payments).set({ status }).where(eq(payments.id, rows[0].id));
  await db
    .update(orders)
    .set({ paymentStatus: status, status: paid ? "confirmed" : undefined })
    .where(eq(orders.id, rows[0].orderId));

  return NextResponse.json({ ok: true, status });
}
