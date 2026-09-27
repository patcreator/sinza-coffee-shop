"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import { inputClass, buttonClass } from "@/components/forms";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "select" | "image" | "json";
  options?: { value: string | number; label: string }[];
};

type Row = Record<string, unknown>;

export function ResourceManager({
  resource,
  title,
  fields,
  columns,
  readOnly = false,
}: {
  resource: string;
  title: string;
  fields: FieldDef[];
  columns: string[];
  readOnly?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Row>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/${resource}`);
    const json = await res.json();
    setRows(json.rows ?? []);
    setLoading(false);
  }, [resource]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setBusy(true);
    setError("");
    const method = draft.id ? "PATCH" : "POST";
    const res = await fetch(`/api/admin/${resource}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setError(json.error || "Save failed");
    setDraft({});
    load();
  }

  async function del(id: unknown) {
    if (!confirm("Delete this row?")) return;
    await fetch(`/api/admin/${resource}?id=${id}`, { method: "DELETE" });
    load();
  }

  async function upload(file: File, field: string) {
    const fd = new FormData();
    fd.append("files", file);
    fd.append("folder", resource);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.uploaded?.[0]?.url) setDraft((d) => ({ ...d, [field]: json.uploaded[0].url }));
    else setError(json.error || "Upload failed");
  }

  return (
    <section className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={load} className="inline-flex items-center gap-1 text-sm opacity-70 hover:opacity-100">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {!readOnly && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-espresso/10 p-4 md:grid-cols-2 dark:border-cream/10">
          {fields.map((f) => (
            <label key={f.name} className="text-sm">
              <span className="mb-1 block font-medium opacity-75">{f.label}</span>
              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  className={inputClass}
                  value={String(draft[f.name] ?? "")}
                  onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                />
              ) : f.type === "checkbox" ? (
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[#923F0C]"
                  checked={Boolean(draft[f.name])}
                  onChange={(e) => setDraft({ ...draft, [f.name]: e.target.checked })}
                />
              ) : f.type === "select" ? (
                <select
                  className={inputClass}
                  value={String(draft[f.name] ?? "")}
                  onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                >
                  <option value="">—</option>
                  {f.options?.map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === "image" ? (
                <div className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    placeholder="https://… or upload"
                    value={String(draft[f.name] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                  />
                  <label className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-espresso/20 dark:border-cream/20">
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], f.name)}
                    />
                  </label>
                </div>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  className={inputClass}
                  value={String(draft[f.name] ?? "")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value,
                    })
                  }
                />
              )}
            </label>
          ))}

          <div className="flex items-center gap-2 md:col-span-2">
            <button onClick={save} disabled={busy} className={buttonClass}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : draft.id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {draft.id ? "Update" : "Create"}
            </button>
            {draft.id ? (
              <button onClick={() => setDraft({})} className="text-sm opacity-70 hover:opacity-100">
                Cancel edit
              </button>
            ) : null}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="grid place-items-center py-10 opacity-60">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-espresso/15 text-xs uppercase tracking-wide opacity-60 dark:border-cream/15">
                {columns.map((c) => (
                  <th key={c} className="py-2 pr-3">
                    {c}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-espresso/8 dark:border-cream/8">
                  {columns.map((c) => (
                    <td key={c} className="max-w-[240px] truncate py-2 pr-3">
                      {typeof r[c] === "boolean" ? (r[c] ? "yes" : "no") : String(r[c] ?? "")}
                    </td>
                  ))}
                  <td className="py-2 text-right">
                    {!readOnly && (
                      <span className="flex justify-end gap-2">
                        <button onClick={() => setDraft(r)} className="text-xs text-cinnamon underline">
                          edit
                        </button>
                        <button onClick={() => del(r.id)} aria-label="Delete" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
