import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import { categories, menuItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { frw, SITE_URL } from "@/lib/utils";
import { AddToCart } from "@/components/add-to-cart";
import { ShareRow } from "@/components/share-row";
import { Coffee } from "lucide-react";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const rows = await db.select().from(menuItems).where(eq(menuItems.slug, slug)).limit(1);
  if (!rows.length) return null;
  const item = rows[0];
  const cat = (await db.select().from(categories).where(eq(categories.id, item.categoryId)).limit(1))[0] ?? null;
  const related = (await db.select().from(menuItems).where(eq(menuItems.categoryId, item.categoryId)).limit(7)).filter(
    (r) => r.id !== item.id,
  );
  return { item, cat, related };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: "Item not found" };
  const title = `${data.item.name} — ${frw(data.item.price)}`;
  return {
    title,
    description: data.item.description ?? undefined,
    openGraph: {
      title,
      description: data.item.description ?? undefined,
      url: `${SITE_URL}/item/${slug}`,
      images: [data.item.image || `${SITE_URL}/og-image.jpg`],
    },
    twitter: { card: "summary_large_image", title, description: data.item.description ?? undefined },
  };
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { item, cat, related } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <nav className="text-sm opacity-70">
        <Link href="/menu" className="hover:underline">
          Menu
        </Link>{" "}
        ›{" "}
        <Link href={`/menu?category=${cat?.slug ?? "all"}`} className="hover:underline">
          {cat?.name ?? "Category"}
        </Link>{" "}
        › <span>{item.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-espresso to-cinnamon">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="600px" />
          ) : (
            <div className="grid h-full place-items-center text-cream/60">
              <Coffee className="h-16 w-16" />
            </div>
          )}
        </div>

        <div>
          <span className="rounded-full bg-cinnamon/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cinnamon">
            {cat?.name}
          </span>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{item.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-cinnamon">{frw(item.price)}</p>
          <p className="mt-4 text-sm leading-relaxed opacity-80">
            {item.longDescription || item.description}
          </p>

          <AddToCart
            item={{
              id: item.id,
              name: item.name,
              slug: item.slug,
              price: item.price,
              image: item.image,
              options: item.options ?? [],
            }}
          />

          <ShareRow
            url={`${SITE_URL}/item/${item.slug}`}
            title={`${item.name} — ${frw(item.price)} at Sinza Coffee Shop`}
          />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold">More from {cat?.name}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/item/${r.slug}`}
                className="rounded-2xl border border-espresso/12 bg-ivory p-4 transition hover:border-cinnamon dark:border-cream/12 dark:bg-white/5"
              >
                <p className="font-medium">{r.name}</p>
                <p className="mt-1 text-sm text-cinnamon">{frw(r.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
