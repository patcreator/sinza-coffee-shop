import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { ContactForm } from "@/components/forms";
import { ShareRow } from "@/components/share-row";
import { SITE_URL } from "@/lib/utils";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { FaInstagram, FaThreads, FaTiktok, FaWhatsapp } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, WhatsApp, email or visit Sinza Coffee Shop in Gisozi (Kwa Gakire), Kigali.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-semibold tracking-tight">Contact us</h1>
      <p className="mt-3 max-w-2xl opacity-80">
        Sinza Coffee Shop Coffee, Meals 📍Gisozi (Kwa Gakire)
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-cinnamon" /> {s.address}
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-cinnamon" /> {s.phone}
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-cinnamon" /> {s.email}
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-cinnamon" /> {s.openingHours}
            </li>
          </ul>

          <div className="mt-5 flex gap-2">
            {[
              { href: `https://wa.me/${s.whatsapp}`, icon: FaWhatsapp, label: "WhatsApp" },
              { href: s.instagram, icon: FaInstagram, label: "Instagram" },
              { href: s.threads, icon: FaThreads, label: "Threads" },
              { href: s.tiktok, icon: FaTiktok, label: "TikTok" },
            ]
              .filter((x) => x.href)
              .map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-espresso/20 transition hover:bg-espresso/10 dark:border-cream/20 dark:hover:bg-cream/10"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-espresso/12 dark:border-cream/12">
            <iframe title="Map" src={s.mapEmbed} className="h-72 w-full" loading="lazy" />
          </div>
          <a href={s.mapLink} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-cinnamon">
            Open in Google Maps ↗
          </a>
        </div>

        <div className="rounded-3xl border border-espresso/12 bg-ivory p-6 dark:border-cream/12 dark:bg-white/5">
          <h2 className="text-lg font-semibold">Send us a message</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
          <ShareRow url={`${SITE_URL}/contact`} title="Contact Sinza Coffee Shop" />
        </div>
      </div>
    </div>
  );
}
