import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { asc, desc } from "drizzle-orm";

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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((g) => (
          <figure key={g.id} className="overflow-hidden rounded-3xl border border-espresso/12 bg-ivory dark:border-cream/12 dark:bg-white/5">
            <div className="relative aspect-[4/3] bg-espresso/10">
              {g.kind === "video" ? (
                <video className="h-full w-full object-cover" controls>
                  <source src={g.url} />
                </video>
              ) : (
                <Image src={g.url} alt={g.title} fill className="object-cover" sizes="400px" />
              )}
            </div>
            <figcaption className="p-4">
              <h2 className="font-semibold">{g.title}</h2>
              <p className="mt-1 text-sm opacity-70">{g.description}</p>
              <p className="mt-2 text-xs opacity-50">
                {g.type} ·{" "}
                {g.takenAt
                  ? new Date(g.takenAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      {visible.length === 0 && <p className="py-20 text-center opacity-70">No media yet.</p>}
    </div>
  );
}
