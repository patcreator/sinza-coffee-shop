"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { FaInstagram, FaThreads, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/components/providers";
import type { SiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/blog", label: "Blogs" },
   // { href: "/events", label: "Events" },
  // { href: "/offers", label: "Offers" },
  { href: "/galleries", label: "Galleries" },
  { href: "/about", label: "About" },
  { href: "/reservation", label: "Reservation" },
  { href: "/contact", label: "Contact" },
];

const TRANSPARENT_PAGES = ["/"];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, ready } = useCart();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const hasHero = TRANSPARENT_PAGES.includes(pathname ?? "");
  const transparent = hasHero && !scrolled && !open;

  const iconBtn = transparent
    ? "border-white/40 text-white hover:bg-white/15"
    : "border-espresso/20 text-espresso hover:bg-espresso/10 dark:border-cream/25 dark:text-cream dark:hover:bg-cream/10";

  return (
    <>
    <header
      className={cn(
        "top-0 z-50 w-full border-b transition-colors duration-300",
        hasHero ? "fixed inset-x-0" : "sticky",
        transparent
          ? "border-transparent bg-transparent"
          : "border-espresso/10 glass dark:border-cream/10",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        {/* LOGO: swaps with header state */}
        <Link href="/" className="relative block h-10 w-10 shrink-0 px-2">
          <Image
            src="/logo-no-color-white.png"
            alt="logo"
            width={40}
            height={40}
            priority
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              transparent ? "opacity-100" : "opacity-0",
            )}
          />
          <Image
            src="/logo-no-color.png"
            alt="logo"
            width={40}
            height={40}
            priority
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              transparent ? "opacity-0" : "opacity-100",
            )}
          />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition",
                pathname === l.href
                  ? "bg-espresso text-cream dark:bg-cinnamon"
                  : transparent
                    ? "text-white hover:bg-white/15"
                    : "text-espresso hover:bg-espresso/10 dark:text-cream dark:hover:bg-cream/10",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          
           
          <a href={settings.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className={cn(
              "hidden h-9 w-9 place-items-center rounded-full border transition sm:grid",
              iconBtn,
            )}
          >
            <FaInstagram className="h-4 w-4" />
          </a>
          
            <a href={settings.threads}
            target="_blank"
            rel="noreferrer"
            aria-label="Threads"
            className={cn(
              "hidden h-9 w-9 place-items-center rounded-full border transition sm:grid",
              iconBtn,
            )}
          >
            <FaThreads className="h-4 w-4" />
          </a>

          {/* Theme toggle now follows the same style as the other buttons */}
          <ThemeToggle className={cn("h-9 w-9 rounded-full border transition", iconBtn)} />

          <Link
            href="/cart"
            aria-label="Cart"
            className={cn(
              "relative grid h-9 w-9 place-items-center rounded-full border transition",
              iconBtn,
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            {ready && count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-cinnamon px-1 text-[10px] font-bold text-ivory">
                {count}
              </span>
            )}
          </Link>

          
          <a  href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border transition",
              iconBtn,
            )}
          >
            <FaWhatsapp className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border transition lg:hidden",
              iconBtn,
            )}
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
                className="rounded-xl border border-espresso/10 px-3 py-2 text-sm text-espresso dark:border-cream/10 dark:text-cream"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            
            <a  href={`https://wa.me/${settings.whatsapp}`}
              className="flex-1 rounded-xl bg-cinnamon px-3 py-2 text-center text-sm font-semibold text-ivory"
            >
              WhatsApp now
            </a>
            
            <a  href={settings.tiktok}
              aria-label="TikTok"
              className="grid h-9 w-9 place-items-center rounded-full border border-espresso/20 text-espresso dark:border-cream/25 dark:text-cream"
            >
              <FaTiktok className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
    </>
  );
}