"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";
import { frw } from "@/lib/utils";

type Stats = {
  daily: { day: string; revenue: number; orders: number }[];
  weekly: { week: string; revenue: number; orders: number }[];
  monthly: { month: string; revenue: number; orders: number }[];
  topItems: { name: string; qty: number; revenue: number }[];
  totals: { orders: number; revenue: number; paid: number; pending: number };
  channels: { channel: string; count: number }[];
  audience: { subscribers: number; reservations: number; messages: number };
};

const COLORS = ["#923F0C", "#35180B", "#C79A6B", "#5B3A25", "#D9A066", "#7A2E07", "#2C150A", "#B5794A"];

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [range, setRange] = useState("30");

  useEffect(() => {
    fetch(`/api/admin/stats?range=${range}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, [range]);

  if (!stats)
    return (
      <div className="grid place-items-center py-24 opacity-60">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  const totalQty = stats.topItems.reduce((s, i) => s + i.qty, 0) || 1;
  const pieData = stats.topItems.map((i) => ({
    name: i.name,
    value: i.qty,
    percent: Math.round((i.qty / totalQty) * 1000) / 10,
  }));

  const cards = [
    { label: "Orders", value: stats.totals.orders },
    { label: "Revenue", value: frw(stats.totals.revenue) },
    { label: "Paid", value: frw(stats.totals.paid) },
    { label: "Pending orders", value: stats.totals.pending },
    { label: "Subscribers", value: stats.audience.subscribers },
    { label: "Reservations", value: stats.audience.reservations },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold">Reports</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="ml-auto rounded-full border border-espresso/15 bg-ivory px-4 py-2 text-sm dark:border-cream/15 dark:bg-white/5"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 12 months</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-espresso/12 bg-ivory p-4 dark:border-cream/12 dark:bg-white/5">
            <p className="text-xs uppercase tracking-wide opacity-60">{c.label}</p>
            <p className="mt-1 text-lg font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Revenue per day</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v: unknown) => frw(Number(v))} />
                <Bar dataKey="revenue" fill="#923F0C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Sold per month</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v: unknown) => frw(Number(v))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#35180B" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#C79A6B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Sold per week</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weekly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v: unknown) => frw(Number(v))} />
                <Bar dataKey="revenue" fill="#35180B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Most bought items (%)</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label={(d) => `${d.name} ${d.percent}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {pieData.length === 0 && <p className="text-sm opacity-60">No sales yet.</p>}
        </div>
      </div>

      <div className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
        <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Order channels</h3>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {stats.channels.map((c) => (
            <span key={c.channel} className="rounded-full bg-espresso/10 px-4 py-1.5 dark:bg-cream/10">
              {c.channel}: <strong>{c.count}</strong>
            </span>
          ))}
          {stats.channels.length === 0 && <span className="opacity-60">No orders yet.</span>}
        </div>
      </div>
    </div>
  );
}
