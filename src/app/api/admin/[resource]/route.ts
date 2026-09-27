import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getResource } from "@/lib/resources";
import { requireRole } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ resource: string }> }) {
  const staff = await requireRole(["admin", "editor"]);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource } = await ctx.params;

  if (resource === "settings") {
    return NextResponse.json({ rows: [await getSettings()] });
  }

  const table = getResource(resource);
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  const rows = await db.select().from(table).limit(500);
  return NextResponse.json({ rows });
}

export async function POST(request: Request, ctx: { params: Promise<{ resource: string }> }) {
  const staff = await requireRole(["admin", "editor"]);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  if (resource === "settings") {
    const current = await getSettings();
    const merged = { ...current, ...body };
    await db
      .insert(settings)
      .values({ key: "site", value: merged })
      .onConflictDoUpdate({ target: settings.key, set: { value: merged, updatedAt: new Date() } });
    return NextResponse.json({ row: merged });
  }

  const table = getResource(resource);
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

  const values: Record<string, unknown> = { ...body };
  if (typeof values.name === "string" && !values.slug && ["items", "categories", "menus"].includes(resource)) {
    values.slug = slugify(values.name);
  }
  if (typeof values.title === "string" && !values.slug && resource === "posts") {
    values.slug = slugify(values.title);
  }
  delete values.id;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inserted = await db.insert(table).values(values as any).returning();
    return NextResponse.json({ row: inserted[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Insert failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, ctx: { params: Promise<{ resource: string }> }) {
  const staff = await requireRole(["admin"]);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource } = await ctx.params;
  const table = getResource(resource);
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const col = (table as any).id;
  await db.delete(table).where(eq(col, id));
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, ctx: { params: Promise<{ resource: string }> }) {
  const staff = await requireRole(["admin", "editor"]);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { resource } = await ctx.params;
  const table = getResource(resource);
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const values = { ...body };
  delete values.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const col = (table as any).id;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await db.update(table).set(values as any).where(eq(col, id)).returning();
    return NextResponse.json({ row: updated[0] ?? null });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Update failed" }, { status: 400 });
  }
}
