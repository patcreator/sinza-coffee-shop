import type { Metadata } from "next";
import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { db } from "@/db";
import { faqs, galleries } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { ShareRow } from "@/components/share-row";
import { SITE_URL } from "@/lib/utils";
import { Clock, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sinza Coffee Shop — ☕ Coffee, Meals ✨ — a neighbourhood coffee house in Gisozi (Kwa Gakire), Kigali, Rwanda.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const s = await getSettings();
  const [faqRows, shots] = await Promise.all([
    db.select().from(faqs).where(eq(faqs.active, true)).orderBy(asc(faqs.position)),
    db.select().from(galleries).orderBy(asc(galleries.position)).limit(4),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl font-semibold tracking-tight">About {s.siteName}</h1>
      <p className="mt-4 max-w-3xl text-lg opacity-80">
        Sinza Coffee Shop — ✨ Coffee, Meals ✨ — 📍 Gisozi (Kwa Gakire). We roast Rwandan bourbon beans in small
        batches, cook honest all-day food, and pour cocktails when the sun goes down. Whether you come for a quiet
        flat white, a King Size Rolex or a Friday night with friends, there is a seat for you.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: MapPin, title: "Where", text: s.address },
          { icon: Clock, title: "When", text: s.openingHours },
          { icon: Phone, title: "Talk to us", text: `${s.phone} · ${s.email}` },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
            <Icon className="h-5 w-5 text-cinnamon" />
            <h2 className="mt-3 text-sm font-semibold uppercase tracking-wide opacity-70">{title}</h2>
            <p className="mt-1 text-sm">{text}</p>
          </div>
        ))}
      </div>

      {shots.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {shots.map((g) => (
            <div key={g.id} className="relative aspect-square overflow-hidden rounded-2xl bg-espresso/10">
              <Image src={g.url} alt={g.title} fill className="object-cover" sizes="300px" />
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-14 text-2xl font-semibold">Frequently asked</h2>
      <div className="mt-4 space-y-3">
        {faqRows.map((f) => (
          <details key={f.id} className="rounded-2xl border border-espresso/12 bg-ivory p-4 dark:border-cream/12 dark:bg-white/5">
            <summary className="cursor-pointer font-medium">{f.question}</summary>
            <p className="mt-2 text-sm opacity-75">{f.answer}</p>
          </details>
        ))}
      </div>

      <ShareRow url={`${SITE_URL}/about`} title="Sinza Coffee Shop — Coffee, Meals — Gisozi, Kigali" />
    </div>
  );
}
