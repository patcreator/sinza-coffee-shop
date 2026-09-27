import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, menuItems, menus } from "@/db/schema";
import { and, asc, eq, ilike, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const menuSlug = searchParams.get("menu");
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();

  const menuRows = await db.select().from(menus).where(eq(menus.active, true)).orderBy(asc(menus.position));
  const activeMenu = menuSlug ? menuRows.find((m) => m.slug === menuSlug) : menuRows[0];

  const catRows = await db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.position));

  const filters = [eq(menuItems.available, true)];
  if (q) {
    const like = `%${q}%`;
    const search = or(ilike(menuItems.name, like), ilike(menuItems.description, like));
    if (search) filters.push(search);
  }

  const itemRows = await db
    .select()
    .from(menuItems)
    .where(and(...filters))
    .orderBy(asc(menuItems.position), asc(menuItems.name));

  const catById = new Map(catRows.map((c) => [c.id, c]));
  let matchedCategoryIds: number[] | null = null;
  if (q) {
    const like = q.toLowerCase();
    matchedCategoryIds = catRows.filter((c) => c.name.toLowerCase().includes(like)).map((c) => c.id);
  }

  const visibleItems = itemRows.filter((item) => {
    const cat = catById.get(item.categoryId);
    if (!cat) return false;
    if (category && category !== "all" && cat.slug !== category) return false;
    return true;
  });

  const extraItems = matchedCategoryIds?.length
    ? (
        await db
          .select()
          .from(menuItems)
          .where(eq(menuItems.available, true))
          .orderBy(asc(menuItems.position))
      ).filter(
        (i) =>
          matchedCategoryIds!.includes(i.categoryId) &&
          !visibleItems.some((v) => v.id === i.id) &&
          (!category || category === "all" || catById.get(i.categoryId)?.slug === category),
      )
    : [];

  const all = [...visibleItems, ...extraItems];

  const grouped = catRows
    .filter((c) => !category || category === "all" || c.slug === category)
    .map((c) => ({
      category: c,
      items: all.filter((i) => i.categoryId === c.id),
    }))
    .filter((g) => g.items.length > 0);

  return NextResponse.json({
    menus: menuRows,
    activeMenu: activeMenu ?? null,
    categories: catRows,
    groups: grouped,
    featured: all.filter((i) => i.featured).slice(0, 8),
    count: all.length,
  });
}
