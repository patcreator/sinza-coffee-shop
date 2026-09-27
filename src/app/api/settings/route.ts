import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { db } from "@/db";
import { faqs, languages, translations } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "en";
  const [site, faqRows, langRows, translationRows] = await Promise.all([
    getSettings(),
    db.select().from(faqs).where(eq(faqs.active, true)).orderBy(asc(faqs.position)),
    db.select().from(languages).where(eq(languages.active, true)),
    db.select().from(translations).where(eq(translations.locale, locale)),
  ]);
  return NextResponse.json({
    settings: site,
    faqs: faqRows,
    languages: langRows,
    translations: Object.fromEntries(translationRows.map((t) => [t.key, t.value])),
  });
}
