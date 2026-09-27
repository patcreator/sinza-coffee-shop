import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { db } from "@/db";
import { orderItems, orders, waiters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { frw, SITE_URL } from "@/lib/utils";
import { PayPanel } from "@/components/pay-panel";
import { ShareRow } from "@/components/share-row";
import { CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const rows = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  if (!rows.length) notFound();
  const order = rows[0];
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const waiter = order.waiterId
    ? (await db.select().from(waiters).where(eq(waiters.id, order.waiterId)).limit(1))[0]
    : null;

  const payUrl = `${SITE_URL}/order/${order.code}`;
  const qr = await QRCode.toDataURL(payUrl, { margin: 1, width: 320, color: { dark: "#35180B", light: "#FBFBEC" } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="rounded-3xl border border-espresso/12 bg-ivory p-8 dark:border-cream/12 dark:bg-white/5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-600/12 px-3 py-1 text-sm font-semibold text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" /> Order received
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-espresso/10 px-3 py-1 text-sm dark:bg-cream/10">
            <Clock className="h-4 w-4" /> {order.status}
          </span>
          <span className="ml-auto font-mono text-lg font-bold">{order.code}</span>
        </div>

        <h1 className="mt-5 text-2xl font-semibold">Thank you{order.customerName ? `, ${order.customerName}` : ""}!</h1>
        <p className="mt-1 text-sm opacity-70">
          Channel: <strong>{order.channel}</strong>
          {waiter ? ` · served by ${waiter.name}` : ""}
          {order.tableLabel ? ` · ${order.tableLabel}` : ""}
        </p>

        <div className="mt-6 grid gap-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <table className="w-full text-sm">
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-espresso/10 dark:border-cream/10">
                    <td className="py-2">
                      {i.quantity} × {i.name}
                      {i.options && i.options.length > 0 && (
                        <span className="block text-xs opacity-60">{i.options.map((o) => o.name).join(", ")}</span>
                      )}
                    </td>
                    <td className="py-2 text-right">{frw(i.lineTotal)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-3 font-semibold">Total</td>
                  <td className="pt-3 text-right font-semibold">{frw(order.total)}</td>
                </tr>
              </tbody>
            </table>

            <PayPanel code={order.code} total={order.total} paymentStatus={order.paymentStatus} />
          </div>

          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={`QR code for order ${order.code}`} className="mx-auto rounded-2xl" width={220} height={220} />
            <p className="mt-2 text-xs opacity-70">
              Scan to open and pay this order from any phone, or share the link below.
            </p>
            <ShareRow url={payUrl} title={`My Sinza Coffee Shop order ${order.code}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
