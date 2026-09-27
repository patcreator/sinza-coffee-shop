import type { MetadataRoute } from "next";
import { db } from "@/db";
import { menuItems, posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = [
    "",
    "/menu",
    "/events",
    "/offers",
    "/blog",
    "/gallery",
    "/about",
    "/contact",
    "/reservation",
    "/feedback",
    "/sign-in",
  ].map((p) => ({ url: `${SITE_URL}${p}`, lastModified: new Date() }));

  try {
    const [items, articles] = await Promise.all([
      db.select().from(menuItems).where(eq(menuItems.available, true)).limit(300),
      db.select().from(posts).where(eq(posts.published, true)).limit(200),
    ]);
    return [
      ...statics,
      ...items.map((i) => ({ url: `${SITE_URL}/item/${i.slug}`, lastModified: new Date(i.createdAt) })),
      ...articles.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: new Date(p.createdAt) })),
    ];
  } catch {
    return statics;
  }
}
