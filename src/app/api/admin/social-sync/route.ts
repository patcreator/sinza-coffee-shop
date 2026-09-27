import { NextResponse } from "next/server";
import { db } from "@/db";
import { socialPosts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

const ACTORS: Record<string, string> = {
  instagram: "apify~instagram-scraper",
  threads: "curious_coder~threads-scraper",
  tiktok: "clockworks~tiktok-scraper",
};

export async function GET() {
  const rows = await db.select().from(socialPosts).orderBy(desc(socialPosts.postedAt)).limit(60);
  return NextResponse.json({ rows });
}

export async function POST(request: Request) {
  const staff = await requireRole(["admin", "editor"]);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const platform = String(body.platform || "instagram");
  const token = process.env.APIFY_TOKEN;
  const actor = ACTORS[platform];
  if (!actor) return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  if (!token) {
    return NextResponse.json(
      { error: "APIFY_TOKEN is not configured. Add it to .env to sync social posts." },
      { status: 400 },
    );
  }

  const input =
    platform === "instagram"
      ? { directUrls: ["https://www.instagram.com/sinzacoffeeshop/"], resultsLimit: 12, resultsType: "posts" }
      : platform === "threads"
        ? { urls: ["https://www.threads.com/@sinzacoffeeshop"], maxItems: 12 }
        : { profiles: ["sinzacoffeeshop"], resultsPerPage: 12 };

  const res = await fetch(
    `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
  );

  if (!res.ok) {
    return NextResponse.json({ error: `Apify responded ${res.status}` }, { status: 502 });
  }

  const items = (await res.json()) as Record<string, unknown>[];
  let saved = 0;
  for (const raw of items) {
    const externalId = String(raw.id ?? raw.postId ?? raw.pk ?? raw.url ?? Math.random());
    const media = String(raw.displayUrl ?? raw.videoUrl ?? raw.coverUrl ?? raw.image ?? "");
    const permalink = String(raw.url ?? raw.permalink ?? raw.webVideoUrl ?? "");
    const caption = String(raw.caption ?? raw.text ?? raw.description ?? "");
    const postedAtRaw = raw.timestamp ?? raw.createTimeISO ?? raw.publishedOn;
    await db.insert(socialPosts).values({
      platform,
      externalId,
      caption,
      media,
      permalink,
      likes: Number(raw.likesCount ?? raw.diggCount ?? 0) || 0,
      postedAt: postedAtRaw ? new Date(String(postedAtRaw)) : new Date(),
    });
    saved += 1;
  }

  return NextResponse.json({ ok: true, saved, platform });
}
