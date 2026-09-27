import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const where = type
    ? and(eq(posts.published, true), eq(posts.type, type))
    : eq(posts.published, true);
  const rows = await db.select().from(posts).where(where).orderBy(desc(posts.createdAt));
  return NextResponse.json({ posts: rows });
}
