import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ShareRow } from "@/components/share-row";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const rows = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      url: `${SITE_URL}/blog/${slug}`,
      images: [post.cover || `${SITE_URL}/og-image.jpg`],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt ?? undefined },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <Link href="/blog" className="text-sm opacity-70 hover:opacity-100">
        ← Back to blog
      </Link>
      <span className="mt-4 block text-xs uppercase tracking-wide text-cinnamon">{post.type}</span>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{post.title}</h1>
      <p className="mt-2 text-sm opacity-60">
        {new Date(post.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
        {post.discount ? ` · ${post.discount} off` : ""}
      </p>

      {post.cover && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl">
          <Image src={post.cover} alt={post.title} fill className="object-cover" sizes="800px" />
        </div>
      )}

      {post.video && (
        <video className="mt-6 w-full rounded-3xl" controls poster={post.cover ?? undefined}>
          <source src={post.video} />
        </video>
      )}

      <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed opacity-90">{post.body}</div>

      {post.link && (
        <Link href={post.link} className="mt-6 inline-block rounded-full bg-cinnamon px-6 py-3 text-sm font-semibold text-ivory">
          Grab it now
        </Link>
      )}

      <ShareRow url={`${SITE_URL}/blog/${post.slug}`} title={post.title} />
    </article>
  );
}
