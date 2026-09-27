import { db } from "@/db";
import { settings } from "@/db/schema";
import { inArray } from "drizzle-orm";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  description: string;
  logo: string;
  favicon: string;
  ogImage: string;
  heroVideo: string;
  heroPoster: string;
  primaryColor: string;
  accentColor: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapEmbed: string;
  mapLink: string;
  openingHours: string;
  instagram: string;
  threads: string;
  tiktok: string;
  facebook: string;
  twitter: string;
  defaultLocale: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Sinza Coffee Shop",
  tagline: "☕ Coffee, Meals ✨",
  description:
    "Sinza Coffee Shop in Gisozi (Kwa Gakire), Kigali — specialty coffee, fresh meals, cocktails and a warm place to meet. Order online, reserve a table or send your order straight to WhatsApp.",
  logo: "/brand/logo.png",
  favicon: "/favicon.png",
  ogImage: "/og-image.jpg",
  heroVideo: "/welcome.mp4",
  heroPoster: "/brand/hero.jpg",
  primaryColor: "#35180B",
  accentColor: "#923F0C",
  phone: "+250 788 000 000",
  whatsapp: "250788000000",
  email: "hello@sinzacoffeeshop.rw",
  address: "Gisozi (Kwa Gakire), Kigali, Rwanda",
  mapEmbed:
    "https://www.google.com/maps?q=-1.9286899,30.0643295&hl=en&z=17&output=embed",
  mapLink:
    "https://www.google.com/maps/@-1.9286899,30.0643295,1386a,75y,100.2h,90t/data=!3m7!1e1!3m5!1sjyqyhI7oM7iB2IyPTNAcAQ!2e0",
  openingHours: "Mon – Sun · 07:00 – 23:00",
  instagram: "https://www.instagram.com/sinzacoffeeshop/",
  threads: "https://www.threads.com/@sinzacoffeeshop",
  tiktok: "https://www.tiktok.com/@sinzacoffeeshop",
  facebook: "",
  twitter: "",
  defaultLocale: "en",
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, ["site"]));
    const stored = (rows[0]?.value ?? {}) as Partial<SiteSettings>;
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
