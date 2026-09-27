import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { readSession } from "@/lib/session";
import { frw } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await readSession();
  if (!session) redirect("/sign-in");

  const myOrders = await db.select().from(orders).where(eq(orders.userId, session.id)).orderBy(desc(orders.createdAt));
  const ids = myOrders.map((o) => o.id);
  const lines = ids.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Hi {session.name || session.email}</h1>
          <p className="mt-1 text-sm opacity-70">Role: {session.role}</p>
        </div>
        <div className="flex gap-2">
          {["admin", "editor"].includes(session.role) && (
            <Link href="/admin" className="rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-cream dark:bg-cinnamon">
              Dashboard
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Your orders</h2>
      <div className="mt-4 space-y-3">
        {myOrders.map((o) => (
          <Link
            key={o.id}
            href={`/order/${o.code}`}
            className="block rounded-2xl border border-espresso/12 bg-ivory p-4 dark:border-cream/12 dark:bg-white/5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono font-semibold">{o.code}</span>
              <span className="rounded-full bg-espresso/10 px-2 py-0.5 text-xs dark:bg-cream/10">{o.status}</span>
              <span className="rounded-full bg-espresso/10 px-2 py-0.5 text-xs dark:bg-cream/10">{o.paymentStatus}</span>
              <span className="ml-auto font-semibold">{frw(o.total)}</span>
            </div>
            <p className="mt-2 text-xs opacity-60">
              {lines
                .filter((l) => l.orderId === o.id)
                .map((l) => `${l.quantity} × ${l.name}`)
                .join(" · ")}
            </p>
          </Link>
        ))}
        {myOrders.length === 0 && <p className="opacity-70">No orders yet.</p>}
      </div>
    </div>
  );
}
