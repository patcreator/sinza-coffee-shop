import { NextResponse } from "next/server";
import { db } from "@/db";
import { tables, waiters } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Waiter selection is only allowed for guests physically inside the restaurant,
 * proven by scanning the table QR code (token).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("token")?.trim() ?? "";
  if (!raw) return NextResponse.json({ error: "Scan the table QR code first." }, { status: 403 });

  // QR may encode a full URL such as https://site/menu?table=SINZA-TABLE-01
  let token = raw;
  try {
    const url = new URL(raw);
    token = url.searchParams.get("table") ?? url.pathname.split("/").pop() ?? raw;
  } catch {
    /* plain token */
  }

  const found = await db.select().from(tables).where(eq(tables.qrToken, token.toUpperCase())).limit(1);
  if (!found.length || !found[0].active) {
    return NextResponse.json({ error: "This QR code is not recognised." }, { status: 403 });
  }

  const list = await db.select().from(waiters).where(eq(waiters.available, true));
  return NextResponse.json({ table: found[0], waiters: list });
}
