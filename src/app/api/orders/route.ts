import { NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems, orderItems, orders, waiters } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { orderCode, frw, SITE_URL } from "@/lib/utils";
import { readSession, requireRole } from "@/lib/session";
import { baseTemplate, sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type IncomingItem = {
  itemId: number;
  quantity?: number;
  options?: { name: string; price: number }[];
};

export async function GET() {
  const admin = await requireRole(["admin", "editor"]);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
  const ids = rows.map((r) => r.id);
  const lines = ids.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)) : [];
  return NextResponse.json({
    orders: rows.map((o) => ({ ...o, items: lines.filter((l) => l.orderId === o.id) })),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const incoming = body.items as IncomingItem[];
  const ids = incoming.map((i) => Number(i.itemId)).filter(Boolean);
  const dbItems = ids.length ? await db.select().from(menuItems).where(inArray(menuItems.id, ids)) : [];
  if (!dbItems.length) return NextResponse.json({ error: "No valid items" }, { status: 400 });

  const session = await readSession();

  const lines = incoming
    .map((line) => {
      const found = dbItems.find((d) => d.id === Number(line.itemId));
      if (!found) return null;
      const quantity = Math.max(1, Math.min(50, Number(line.quantity) || 1));
      const options = (line.options ?? []).filter((o) => o && typeof o.price === "number");
      const unitPrice = found.price + options.reduce((s, o) => s + Number(o.price || 0), 0);
      return {
        itemId: found.id,
        name: found.name,
        unitPrice,
        quantity,
        options,
        lineTotal: unitPrice * quantity,
      };
    })
    .filter(Boolean) as {
    itemId: number;
    name: string;
    unitPrice: number;
    quantity: number;
    options: { name: string; price: number }[];
    lineTotal: number;
  }[];

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const channel = ["waiter", "restaurant", "whatsapp"].includes(body.channel) ? body.channel : "restaurant";

  let waiterId: number | null = null;
  if (channel === "waiter" && body.waiterId) {
    const w = await db.select().from(waiters).where(eq(waiters.id, Number(body.waiterId))).limit(1);
    if (!w.length || !w[0].available) {
      return NextResponse.json({ error: "That waiter is not available" }, { status: 400 });
    }
    waiterId = w[0].id;
  }

  const code = orderCode();
  const [order] = await db
    .insert(orders)
    .values({
      code,
      userId: session?.id ?? null,
      customerName: body.customerName ?? session?.name ?? null,
      customerEmail: body.customerEmail ?? session?.email ?? null,
      customerPhone: body.customerPhone ?? null,
      channel,
      waiterId,
      tableLabel: body.tableLabel ?? null,
      note: body.note ?? null,
      subtotal,
      total: subtotal,
      paymentMethod: body.paymentMethod ?? null,
      status: "pending",
    })
    .returning();

  await db.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));

  const payUrl = `${SITE_URL}/order/${order.code}`;
  if (order.customerEmail) {
    const rowsHtml = lines
      .map(
        (l) =>
          `<tr><td style="padding:6px 0">${l.quantity} × ${l.name}</td><td align="right">${frw(l.lineTotal)}</td></tr>`,
      )
      .join("");
    await sendEmail({
      to: order.customerEmail,
      subject: `Your Sinza order ${order.code}`,
      html: baseTemplate(
        `Order ${order.code} received`,
        `<table width="100%" cellpadding="0" cellspacing="0">${rowsHtml}<tr><td style="padding-top:10px;font-weight:700">Total</td><td align="right" style="padding-top:10px;font-weight:700">${frw(subtotal)}</td></tr></table>
         <p style="margin-top:16px">Pay now with MoMo, Airtel Money or card — or simply pay after eating. Scan the QR on the order page to pay from any phone.</p>`,
        { label: "Open my order", url: payUrl },
      ),
    });
  }

  return NextResponse.json({ order: { ...order, items: lines }, payUrl }, { status: 201 });
}
