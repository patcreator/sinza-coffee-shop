"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { FaInstagram, FaThreads, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import type { SiteSettings } from "@/lib/settings";
import { NewsletterForm } from "@/components/forms";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-20 border-t border-espresso/10 bg-espresso text-cream dark:border-cream/10 dark:bg-[#0f0703]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold">{settings.siteName}</h3>
          <p className="mt-2 text-sm opacity-80">Coffee, Meals</p>
          <p className="mt-1 flex items-start gap-2 text-sm opacity-80">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {settings.address}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm opacity-80">
            <Clock className="h-4 w-4" /> {settings.openingHours}
          </p>
          <div className="mt-4 flex gap-2">
            {[
              { href: settings.instagram, icon: FaInstagram, label: "Instagram" },
              { href: settings.threads, icon: FaThreads, label: "Threads" },
              { href: settings.tiktok, icon: FaTiktok, label: "TikTok" },
              { href: `https://wa.me/${settings.whatsapp}`, icon: FaWhatsapp, label: "WhatsApp" },
            ]
              .filter((s) => s.href)
              .map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full border border-cream/25 transition hover:bg-cream/10"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide opacity-70">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ["/menu", "Menu"],
              ["/menu?category=coffee", "Coffee"],
              ["/menu?category=cocktail-drinks", "Cocktails"],
              ["/events", "Events"],
              ["/offers", "Offers"],
              ["/gallery", "Gallery"],
            ].map(([href, label]) => (
              <li key={label}>
                <Link href={href} className="opacity-80 transition hover:opacity-100">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide opacity-70">Company</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ["/about", "About us"],
              ["/contact", "Contact"],
              ["/reservation", "Reservation"],
              ["/feedback", "Feedback"],
              ["/blog", "Blog"],
              ["/docs", "API docs"],
              ["/admin", "Staff dashboard"],
            ].map(([href, label]) => (
              <li key={label}>
                <Link href={href} className="opacity-80 transition hover:opacity-100">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-sm opacity-80">
            <Phone className="h-4 w-4" /> {settings.phone}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm opacity-80">
            <Mail className="h-4 w-4" /> {settings.email}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide opacity-70">Newsletter</h4>
          <p className="mt-3 text-sm opacity-80">
            Weekly menu drops, offers and events — straight to your inbox.
          </p>
          <div className="mt-3">
            <NewsletterForm compact />
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10 px-4 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {settings.siteName} · Gisozi (Kwa Gakire), Kigali · Built by Patcreator
      </div>
    </footer>
  );
}
