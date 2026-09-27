import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Offers",
  description: "Discounts and special deals at Sinza Coffee Shop, Gisozi Kigali.",
};

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.type, "offer")))
    .orderBy(desc(posts.createdAt));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-semibold tracking-tight">Current offers</h1>
      <p className="mt-3 opacity-80">Fresh deals every week — subscribe to be first to know.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="overflow-hidden rounded-3xl border border-espresso/12 bg-ivory dark:border-cream/12 dark:bg-white/5">
            <div className="relative h-40 bg-gradient-to-br from-cinnamon to-espresso">
              {p.cover && <Image src={p.cover} alt={p.title} fill className="object-cover" sizes="400px" />}
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ivory px-3 py-1 text-xs font-bold text-cinnamon">
                <Sparkles className="h-3 w-3" /> {p.discount ?? "Special"}
              </span>
            </div>
            <div className="p-5">
              <h2 className="font-semibold">{p.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm opacity-70">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
      {rows.length === 0 && <p className="py-20 text-center opacity-70">No active offers right now — check back soon.</p>}
    </div>
  );
}
