import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const staff = await requireRole(["admin", "editor"]);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const range = new URL(request.url).searchParams.get("range") || "30";
  const days = Math.min(365, Math.max(7, Number(range) || 30));

  const daily = await db.execute<{ day: string; revenue: number; orders: number }>(sql`
    select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
           coalesce(sum(total), 0)::int as revenue,
           count(*)::int as orders
    from orders
    where created_at > now() - (${days} || ' days')::interval
    group by 1 order by 1
  `);

  const monthly = await db.execute<{ month: string; revenue: number; orders: number }>(sql`
    select to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
           coalesce(sum(total), 0)::int as revenue,
           count(*)::int as orders
    from orders
    group by 1 order by 1 desc limit 12
  `);

  const weekly = await db.execute<{ week: string; revenue: number; orders: number }>(sql`
    select to_char(date_trunc('week', created_at), 'YYYY-"W"IW') as week,
           coalesce(sum(total), 0)::int as revenue,
           count(*)::int as orders
    from orders
    group by 1 order by 1 desc limit 12
  `);

  const topItems = await db.execute<{ name: string; qty: number; revenue: number }>(sql`
    select name, sum(quantity)::int as qty, sum(line_total)::int as revenue
    from order_items group by 1 order by qty desc limit 8
  `);

  const totals = await db.execute<{
    orders: number;
    revenue: number;
    paid: number;
    pending: number;
  }>(sql`
    select count(*)::int as orders,
           coalesce(sum(total),0)::int as revenue,
           coalesce(sum(case when payment_status = 'paid' then total else 0 end),0)::int as paid,
           count(*) filter (where status = 'pending')::int as pending
    from orders
  `);

  const channels = await db.execute<{ channel: string; count: number }>(sql`
    select channel, count(*)::int as count from orders group by 1
  `);

  const audience = await db.execute<{ subscribers: number; reservations: number; messages: number }>(sql`
    select (select count(*) from subscribers where active)::int as subscribers,
           (select count(*) from reservations)::int as reservations,
           (select count(*) from contact_messages)::int as messages
  `);

  return NextResponse.json({
    daily: daily.rows,
    weekly: weekly.rows.reverse(),
    monthly: monthly.rows.reverse(),
    topItems: topItems.rows,
    totals: totals.rows[0] ?? { orders: 0, revenue: 0, paid: 0, pending: 0 },
    channels: channels.rows,
    audience: audience.rows[0] ?? { subscribers: 0, reservations: 0, messages: 0 },
  });
}
