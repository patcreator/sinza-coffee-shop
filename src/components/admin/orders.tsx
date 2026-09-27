"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { frw } from "@/lib/utils";

type Order = {
  id: number;
  code: string;
  customerName: string | null;
  customerPhone: string | null;
  channel: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: { id: number; name: string; quantity: number }[];
};

const STATUSES = ["pending", "confirmed", "preparing", "served", "completed", "cancelled"];
const PAY = ["unpaid", "pending", "paid", "failed"];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/orders");
    const json = await res.json();
    setOrders(json.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function update(code: string, patch: Record<string, string>) {
    await fetch(`/api/orders/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    load();
  }

  const visible = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <section className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">Orders</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-full border border-espresso/15 bg-transparent px-4 py-1.5 text-sm dark:border-cream/15"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button onClick={load} className="ml-auto inline-flex items-center gap-1 text-sm opacity-70 hover:opacity-100">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16 opacity-60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-espresso/15 text-xs uppercase tracking-wide opacity-60 dark:border-cream/15">
                <th className="py-2">Code</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Channel</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o.id} className="border-b border-espresso/8 dark:border-cream/8">
                  <td className="py-2 font-mono">
                    <Link href={`/order/${o.code}`} className="text-cinnamon underline">
                      {o.code}
                    </Link>
                  </td>
                  <td>{o.customerName || "Guest"}</td>
                  <td className="max-w-[220px] truncate">
                    {o.items?.map((i) => `${i.quantity}×${i.name}`).join(", ")}
                  </td>
                  <td>{o.channel}</td>
                  <td>{frw(o.total)}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => update(o.code, { status: e.target.value })}
                      className="rounded-full border border-espresso/15 bg-transparent px-2 py-1 text-xs dark:border-cream/15"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={o.paymentStatus}
                      onChange={(e) => update(o.code, { paymentStatus: e.target.value })}
                      className="rounded-full border border-espresso/15 bg-transparent px-2 py-1 text-xs dark:border-cream/15"
                    >
                      {PAY.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <p className="py-10 text-center opacity-60">No orders yet.</p>}
        </div>
      )}
    </section>
  );
}
