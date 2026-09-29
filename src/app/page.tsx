import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { categories, faqs, galleries, menuItems, posts } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { getSettings } from "@/lib/settings";
import { frw } from "@/lib/utils";
import { NewsletterForm } from "@/components/forms";
import {
  ArrowRight,
  CalendarDays,
  Coffee,
  MapPin,
  QrCode,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import Hero from "@/components/Hero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const s = await getSettings();
  const [featured, cats, offers, gallery, faqRows] = await Promise.all([
    db.select().from(menuItems).where(eq(menuItems.featured, true)).limit(6),
    db.select().from(categories).orderBy(asc(categories.position)).limit(12),
    db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt)).limit(3),
    db.select().from(galleries).orderBy(asc(galleries.position)).limit(6),
    db.select().from(faqs).where(eq(faqs.active, true)).orderBy(asc(faqs.position)).limit(5),
  ]);

  return (
    <>
      <Hero s={s} />
      {/* ---------------- QUICK CATEGORIES ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Browse the menu</h2>
            <p className="mt-1 text-sm opacity-70">Filter by category, search anything, add to cart.</p>
          </div>
          <Link href="/menu" className="inline-flex items-center gap-1 text-sm font-semibold text-cinnamon">
            All categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/menu?category=${c.slug}`}
              className="shrink-0 rounded-2xl border border-espresso/12 bg-ivory px-5 py-4 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-cinnamon dark:border-cream/12 dark:bg-white/5"
            >
              <Coffee className="mb-2 h-4 w-4 text-cinnamon" />
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED ---------------- */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <h2 className="text-2xl font-semibold sm:text-3xl">Barista picks</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.slug}`}
                className="group overflow-hidden rounded-3xl border border-espresso/12 bg-ivory shadow-sm transition hover:-translate-y-1 dark:border-cream/12 dark:bg-white/5"
              >
                <div className="relative h-44 w-full bg-gradient-to-br from-espresso to-cinnamon">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="grid h-full place-items-center text-cream/60">
                      <Coffee className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm opacity-70">{item.description}</p>
                  <p className="mt-3 font-semibold text-cinnamon">{frw(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- HOW TO ORDER ---------------- */}
      <section className="bg-espresso py-16 text-cream dark:bg-[#201007]">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">Three ways to order</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: QrCode,
                title: "Choose your waiter",
                text: "Scan the table QR code inside the restaurant, then pick any available waiter or waitress.",
              },
              {
                icon: UtensilsCrossed,
                title: "Order to the restaurant",
                text: "Send the order straight to the kitchen. Pay online with MoMo, Airtel or card — or after eating.",
              },
              {
                icon: FaWhatsapp,
                title: "Send to WhatsApp",
                text: "Prefer chatting? We build a neat order message and open WhatsApp for you.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl border border-cream/15 bg-white/5 p-6">
                <Icon className="h-6 w-6 text-latte" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm opacity-80">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- OFFERS / NEWS ---------------- */}
      {offers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold sm:text-3xl">What&apos;s happening</h2>
            <Link href="/blog" className="text-sm font-semibold text-cinnamon">
              Read the blog
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {offers.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="rounded-3xl border border-espresso/12 bg-ivory p-6 transition hover:-translate-y-1 dark:border-cream/12 dark:bg-white/5"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-cinnamon/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cinnamon">
                  <Sparkles className="h-3 w-3" /> {p.discount ? `${p.discount} off` : p.type}
                </span>
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm opacity-70">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- GALLERY ---------------- */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold sm:text-3xl">Gallery</h2>
            <Link href="/gallery" className="text-sm font-semibold text-cinnamon">
              See all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {gallery.map((g) => (
              <div key={g.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-espresso/10">
                <Image src={g.url} alt={g.title} fill className="object-cover transition hover:scale-105" sizes="400px" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- MAP + FAQ ---------------- */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">Find us</h2>
          <p className="mt-2 text-sm opacity-70">{s.address}</p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-espresso/12 dark:border-cream/12">
            <iframe
              title="Sinza Coffee Shop map"
              src={s.mapEmbed}
              className="h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a href={s.mapLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cinnamon">
            Open in Google Maps <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">Good to know</h2>
          <div className="mt-4 space-y-3">
            {faqRows.map((f) => (
              <details key={f.id} className="rounded-2xl border border-espresso/12 bg-ivory p-4 dark:border-cream/12 dark:bg-white/5">
                <summary className="cursor-pointer text-sm font-semibold">{f.question}</summary>
                <p className="mt-2 text-sm opacity-75">{f.answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-espresso/12 bg-ivory p-6 dark:border-cream/12 dark:bg-white/5">
            <h3 className="font-semibold">Join the newsletter</h3>
            <p className="mt-1 text-sm opacity-70">Daily menu or weekly digest — your choice.</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
