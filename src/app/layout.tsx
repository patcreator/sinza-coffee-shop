import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AiAssistant } from "@/components/ai-assistant";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = `${s.siteName} — Coffee, Meals & Cocktails in Gisozi, Kigali`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s · ${s.siteName}` },
    description: s.description,
    authors: [{ name: "Patcreator" }],
    applicationName: s.siteName,
    keywords: [
      "Sinza Coffee Shop",
      "coffee Kigali",
      "Gisozi restaurant",
      "Kwa Gakire",
      "Rwanda specialty coffee",
      "brunch Kigali",
      "cocktails Kigali",
    ],
    manifest: "/site.webmanifest",
    icons: {
      icon: [{ url: "/favicon.png", type: "image/png" }],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180" },
        { url: "/apple-touch-icon.png", sizes: "167x167" },
        { url: "/apple-touch-icon.png", sizes: "152x152" },
        { url: "/apple-touch-icon.png", sizes: "120x120" },
      ],
    },
    openGraph: {
      siteName: s.siteName,
      title,
      description: s.description,
      type: "website",
      url: SITE_URL,
      locale: "en_US",
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${s.siteName} — ${s.tagline} — ${s.address}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: s.description,
      images: [`${SITE_URL}/og-image.jpg`],
    },
    appleWebApp: {
      capable: true,
      title: s.siteName,
      statusBarStyle: "black-translucent",
    },
    alternates: { canonical: SITE_URL },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#35180B" },
    { media: "(prefers-color-scheme: dark)", color: "#170B04" },
  ],
  colorScheme: "dark light",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const s = await getSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: s.siteName,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}/og-image.jpg`,
    description: s.description,
    servesCuisine: ["Coffee", "Rwandan", "Breakfast", "Grill", "Cocktails"],
    priceRange: "RWF 1,000 – 30,000",
    telephone: s.phone,
    email: s.email,
    openingHours: "Mo-Su 07:00-23:00",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Gisozi (Kwa Gakire)",
      addressLocality: "Kigali",
      addressCountry: "RW",
    },
    geo: { "@type": "GeoCoordinates", latitude: -1.9286899, longitude: 30.0643295 },
    hasMap: s.mapLink,
    sameAs: [s.instagram, s.threads, s.tiktok].filter(Boolean),
    acceptsReservations: `${SITE_URL}/reservation`,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-cream text-bean dark:bg-[#170b04] dark:text-cream">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <SiteHeader settings={s} />
          <main className="min-h-[60vh]">{children}</main>
          <SiteFooter settings={s} />
          <AiAssistant />
        </Providers>
      </body>
    </html>
  );
}
