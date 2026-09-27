import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: "Events",
  description: "Live music, coffee cuppings and private events at Sinza Coffee Shop, Kigali.",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.type, "event")))
    .orderBy(desc(posts.createdAt));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl font-semibold tracking-tight">Events at Sinza</h1>
      <p className="mt-3 opacity-80">Live acoustic nights, cuppings, launches and private bookings.</p>

      <div className="mt-8 space-y-4">
        {rows.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="flex flex-col gap-4 rounded-3xl border border-espresso/12 bg-ivory p-5 transition hover:border-cinnamon sm:flex-row dark:border-cream/12 dark:bg-white/5"
          >
            <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-espresso to-cinnamon sm:w-48">
              {p.cover && <Image src={p.cover} alt={p.title} fill className="object-cover" sizes="200px" />}
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-cinnamon">
                <CalendarDays className="h-3 w-3" />
                {p.startsAt
                  ? new Date(p.startsAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                  : "Recurring"}
              </span>
              <h2 className="mt-1 text-lg font-semibold">{p.title}</h2>
              <p className="mt-1 text-sm opacity-70">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="py-20 text-center opacity-70">No events scheduled — follow us on Instagram for updates.</p>
      )}

      <div className="mt-12 rounded-3xl bg-espresso p-8 text-cream dark:bg-[#201007]">
        <h2 className="text-2xl font-semibold">Host your event with us</h2>
        <p className="mt-2 opacity-85">Birthdays, team breakfasts, product launches — we handle the coffee and the food.</p>
        <Link href="/contact" className="mt-5 inline-block rounded-full bg-cinnamon px-6 py-3 text-sm font-semibold text-ivory">
          Talk to our team
        </Link>
      </div>
    </div>
  );
}
