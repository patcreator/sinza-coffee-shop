import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { NewsletterForm } from "@/components/forms";

export const metadata: Metadata = {
  title: "Blog & News",
  description: "Stories, coffee guides, offers and news from Sinza Coffee Shop in Kigali.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const where = type ? and(eq(posts.published, true), eq(posts.type, type)) : eq(posts.published, true);
  const rows = await db.select().from(posts).where(where).orderBy(desc(posts.createdAt));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-semibold tracking-tight">Blog & news</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["", "All"],
          ["blog", "Blog"],
          ["offer", "Offers"],
          ["event", "Events"],
          ["news", "News"],
        ].map(([value, label]) => (
          <Link
            key={label}
            href={value ? `/blog?type=${value}` : "/blog"}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              (type ?? "") === value
                ? "border-cinnamon bg-cinnamon text-ivory"
                : "border-espresso/15 dark:border-cream/15"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="overflow-hidden rounded-3xl border border-espresso/12 bg-ivory transition hover:-translate-y-1 dark:border-cream/12 dark:bg-white/5"
          >
            <div className="relative h-40 bg-gradient-to-br from-espresso to-cinnamon">
              {p.cover && <Image src={p.cover} alt={p.title} fill className="object-cover" sizes="400px" />}
              {p.discount && (
                <span className="absolute left-3 top-3 rounded-full bg-ivory px-3 py-1 text-xs font-bold text-cinnamon">
                  {p.discount} OFF
                </span>
              )}
            </div>
            <div className="p-5">
              <span className="text-[11px] uppercase tracking-wide opacity-60">{p.type}</span>
              <h2 className="mt-1 font-semibold">{p.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm opacity-70">{p.excerpt}</p>
              <p className="mt-3 text-xs opacity-50">
                {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {rows.length === 0 && <p className="py-20 text-center opacity-70">Nothing published yet.</p>}

      <div className="mt-14 rounded-3xl border border-espresso/12 bg-ivory p-6 dark:border-cream/12 dark:bg-white/5">
        <h2 className="text-lg font-semibold">Never miss an offer</h2>
        <p className="mt-1 text-sm opacity-70">Subscribers get every new post and offer by email.</p>
        <div className="mt-4">
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
