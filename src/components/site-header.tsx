"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Coffee, Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { FaInstagram, FaThreads, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/components/providers";
import type { SiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import Image from "next/image";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/events", label: "Events" },
  { href: "/offers", label: "Offers" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/reservation", label: "Reservation" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count, ready } = useCart();

  useEffect(() => setOpen(false), [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-espresso/10 glass dark:border-cream/10">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Image src="/logo-no-color.png" alt="logo" width="40" height="40" />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition hover:bg-espresso/10 dark:hover:bg-cream/10",
                pathname === l.href && "bg-espresso text-cream dark:bg-cinnamon",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <a
            href={settings.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hidden h-9 w-9 place-items-center rounded-full border border-espresso/20 text-espresso transition hover:bg-espresso/10 sm:grid dark:border-cream/25 dark:text-cream"
          >
            <FaInstagram className="h-4 w-4" />
          </a>
          <a
            href={settings.threads}
            target="_blank"
            rel="noreferrer"
            aria-label="Threads"
            className="hidden h-9 w-9 place-items-center rounded-full border border-espresso/20 text-espresso transition hover:bg-espresso/10 sm:grid dark:border-cream/25 dark:text-cream"
          >
            <FaThreads className="h-4 w-4" />
          </a>
          <ThemeToggle />
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-espresso/20 text-espresso dark:border-cream/25 dark:text-cream"
          >
            <ShoppingBag className="h-4 w-4" />
            {ready && count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-cinnamon px-1 text-[10px] font-bold text-ivory">
                {count}
              </span>
            )}
          </Link>
          <a
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full bg-cinnamon px-4 py-2 text-sm font-semibold text-ivory transition hover:opacity-90 sm:inline-flex"
          >
            <FaWhatsapp className="h-4 w-4" /> WhatsApp now
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-espresso/20 lg:hidden dark:border-cream/25"
          >
            {open ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-espresso/10 bg-cream px-4 py-3 lg:hidden dark:border-cream/10 dark:bg-[#170b04]">
          <div className="grid grid-cols-2 gap-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl border border-espresso/10 px-3 py-2 text-sm dark:border-cream/10"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <a href={`https://wa.me/${settings.whatsapp}`} className="flex-1 rounded-xl bg-cinnamon px-3 py-2 text-center text-sm font-semibold text-ivory">
              WhatsApp now
            </a>
            <a href={settings.tiktok} aria-label="TikTok" className="grid h-9 w-9 place-items-center rounded-full border border-espresso/20 dark:border-cream/25">
              <FaTiktok className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
