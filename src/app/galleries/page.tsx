import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import GalleryGrid, { type GalleryItem } from "@/components/gallery-grid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and videos from inside Sinza Coffee Shop, Gisozi (Kwa Gakire), Kigali.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const rows = await db.select().from(galleries).orderBy(asc(galleries.position), desc(galleries.takenAt));
  const types = [...new Set(rows.map((r) => r.type))];
  const visible = type ? rows.filter((r) => r.type === type) : rows;

  // Dates must be serialised before crossing the server -> client boundary.
  const items: GalleryItem[] = visible.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    url: g.url,
    kind: g.kind,
    type: g.type,
    takenAt: g.takenAt ? new Date(g.takenAt).toISOString() : null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-semibold tracking-tight">Gallery</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/gallery"
          className={`rounded-full border px-4 py-1.5 text-sm ${!type ? "border-cinnamon bg-cinnamon text-ivory" : "border-espresso/15 dark:border-cream/15"}`}
        >
          All
        </Link>
        {types.map((t) => (
          <Link
            key={t}
            href={`/gallery?type=${t}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${type === t ? "border-cinnamon bg-cinnamon text-ivory" : "border-espresso/15 dark:border-cream/15"}`}
          >
            {t}
          </Link>
        ))}
      </div>

      <GalleryGrid items={items} />

      {items.length === 0 && <p className="py-20 text-center opacity-70">No media yet.</p>}
    </div>
  );
}