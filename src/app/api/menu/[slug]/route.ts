import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, menuItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const rows = await db.select().from(menuItems).where(eq(menuItems.slug, slug)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const item = rows[0];
  const cat = await db.select().from(categories).where(eq(categories.id, item.categoryId)).limit(1);
  const related = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.categoryId, item.categoryId))
    .limit(6);
  return NextResponse.json({ item, category: cat[0] ?? null, related: related.filter((r) => r.id !== item.id) });
}
