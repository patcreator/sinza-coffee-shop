import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { r2Configured, uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const staff = await requireRole(["admin", "editor"]);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const folder = String(form.get("folder") || "uploads");
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files provided" }, { status: 400 });

  const uploaded = [];
  for (const file of files) {
    try {
      uploaded.push(await uploadToR2(file, folder));
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Upload failed", uploaded },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ uploaded, storage: r2Configured ? "r2" : "inline" });
}
