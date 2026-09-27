import { NextResponse } from "next/server";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { asc, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(galleries).orderBy(asc(galleries.position), desc(galleries.takenAt));
  return NextResponse.json({ gallery: rows, types: [...new Set(rows.map((r) => r.type))] });
}
