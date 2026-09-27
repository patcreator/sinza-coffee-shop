"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Upload } from "lucide-react";
import { inputClass, buttonClass } from "@/components/forms";
import type { SiteSettings } from "@/lib/settings";

const GROUPS: { title: string; keys: (keyof SiteSettings)[] }[] = [
  { title: "Identity", keys: ["siteName", "tagline", "description", "defaultLocale"] },
  { title: "Brand & media", keys: ["logo", "favicon", "ogImage", "heroVideo", "heroPoster", "primaryColor", "accentColor"] },
  { title: "Contact", keys: ["phone", "whatsapp", "email", "address", "openingHours", "mapEmbed", "mapLink"] },
  { title: "Social", keys: ["instagram", "threads", "tiktok", "facebook", "twitter"] },
];

export function SettingsEditor() {
  const [data, setData] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => setData(j.rows?.[0] ?? null));
  }, []);

  async function upload(file: File, key: keyof SiteSettings) {
    const fd = new FormData();
    fd.append("files", file);
    fd.append("folder", "brand");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.uploaded?.[0]?.url && data) setData({ ...data, [key]: json.uploaded[0].url });
  }

  async function save() {
    if (!data) return;
    setBusy(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    setMsg("Saved — refresh the site to see the changes.");
  }

  if (!data)
    return (
      <div className="grid place-items-center py-20 opacity-60">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {GROUPS.map((g) => (
        <section key={g.title} className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
          <h2 className="text-lg font-semibold">{g.title}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {g.keys.map((k) => (
              <label key={String(k)} className="text-sm">
                <span className="mb-1 block font-medium opacity-75">{String(k)}</span>
                <div className="flex items-center gap-2">
                  {k === "description" || k === "mapEmbed" ? (
                    <textarea
                      rows={3}
                      className={inputClass}
                      value={String(data[k] ?? "")}
                      onChange={(e) => setData({ ...data, [k]: e.target.value })}
                    />
                  ) : (
                    <input
                      className={inputClass}
                      type={k.toLowerCase().includes("color") ? "text" : "text"}
                      value={String(data[k] ?? "")}
                      onChange={(e) => setData({ ...data, [k]: e.target.value })}
                    />
                  )}
                  {["logo", "favicon", "ogImage", "heroVideo", "heroPoster"].includes(String(k)) && (
                    <label className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-espresso/20 dark:border-cream/20">
                      <Upload className="h-4 w-4" />
                      <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], k)} />
                    </label>
                  )}
                </div>
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className={buttonClass}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings
        </button>
        {msg && <span className="text-sm opacity-80">{msg}</span>}
      </div>
    </div>
  );
}
