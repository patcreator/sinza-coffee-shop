"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { inputClass, buttonClass } from "@/components/forms";

type Template = { id: number; name: string; subject: string; html: string; category: string };
type Log = { id: number; toAddress: string; subject: string; status: string; createdAt: string };

const GOOGLE_STYLE_TEMPLATES: { name: string; subject: string; html: string }[] = [
  {
    name: "Table / concerns (Google style)",
    subject: "Following up on your visit",
    html: `<p>Hello,</p><p>Thank you for sharing your concerns. Here is a summary:</p>
<table width="100%" cellpadding="8" style="border-collapse:collapse;border:1px solid #e6d9cd">
  <tr style="background:#F7F0EB"><th align="left">Topic</th><th align="left">Status</th><th align="left">Next step</th></tr>
  <tr><td>Order accuracy</td><td>Resolved</td><td>Complimentary coffee on your next visit</td></tr>
  <tr><td>Waiting time</td><td>In progress</td><td>Extra staff on weekends</td></tr>
</table>
<p>Warm regards,<br/>Sinza Coffee Shop</p>`,
  },
  {
    name: "Weekly menu table",
    subject: "This week's menu ☕",
    html: `<p>Here is what we are serving this week:</p>
<table width="100%" cellpadding="8" style="border-collapse:collapse;border:1px solid #e6d9cd">
  <tr style="background:#F7F0EB"><th align="left">Item</th><th align="right">Price</th></tr>
  <tr><td>Sinza Signature Coffee</td><td align="right">4,000 RWF</td></tr>
  <tr><td>King Size Rolex</td><td align="right">4,500 RWF</td></tr>
  <tr><td>BBQ Chicken Wings</td><td align="right">8,500 RWF</td></tr>
</table>`,
  },
  {
    name: "Offer announcement",
    subject: "20% off this week only",
    html: `<h2 style="color:#923F0C">20% off every Rolex</h2><p>From Monday to Friday, every Rolex is 20% cheaper. Dine in or order online.</p>`,
  },
];

export function EmailStudio() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [audience, setAudience] = useState("subscribers");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  const load = useCallback(async () => {
    const [t, l] = await Promise.all([
      fetch("/api/admin/templates").then((r) => r.json()),
      fetch("/api/admin/email").then((r) => r.json()),
    ]);
    setTemplates(t.rows ?? []);
    setLogs(l.rows ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function send() {
    setBusy(true);
    setResult("");
    const res = await fetch("/api/admin/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, html, audience, to: audience === "custom" ? to.split(",").map((s) => s.trim()) : undefined }),
    });
    const json = await res.json();
    setBusy(false);
    setResult(json.error ? `Error: ${json.error}` : `Sent to ${json.sent} recipient(s).`);
    load();
  }

  async function saveTemplate() {
    await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: subject || "Untitled", subject, html, category: "custom" }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
        <h2 className="text-lg font-semibold">Compose</h2>
        <p className="mt-1 text-sm opacity-70">
          Pick a ready-made template, edit the HTML and send it to your subscribers.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[...GOOGLE_STYLE_TEMPLATES, ...templates].map((t, i) => (
            <button
              key={i}
              onClick={() => {
                setSubject(t.subject);
                setHtml(t.html);
              }}
              className="rounded-full border border-espresso/20 px-4 py-1.5 text-xs dark:border-cream/20"
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <input className={inputClass} placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <textarea
              rows={14}
              className={`${inputClass} font-mono text-xs`}
              placeholder="<p>HTML body…</p>"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <select className={inputClass} value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="subscribers">All newsletter subscribers</option>
                <option value="custom">Custom addresses</option>
              </select>
              {audience === "custom" && (
                <input className={inputClass} placeholder="a@b.com, c@d.com" value={to} onChange={(e) => setTo(e.target.value)} />
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={send} disabled={busy} className={buttonClass}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
              </button>
              <button onClick={saveTemplate} className="rounded-full border border-espresso/20 px-5 py-2.5 text-sm dark:border-cream/20">
                Save as template
              </button>
            </div>
            {result && <p className="text-sm opacity-80">{result}</p>}
          </div>

          <div className="rounded-2xl border border-espresso/10 bg-white p-4 dark:border-cream/10">
            <p className="mb-2 text-xs uppercase tracking-wide opacity-60">Preview</p>
            <div className="prose max-w-none text-sm text-black" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Mail className="h-4 w-4" /> Sent emails
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-espresso/15 text-xs uppercase tracking-wide opacity-60 dark:border-cream/15">
                <th className="py-2">To</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-espresso/8 dark:border-cream/8">
                  <td className="py-2">{l.toAddress}</td>
                  <td>{l.subject}</td>
                  <td>{l.status}</td>
                  <td>{new Date(l.createdAt).toLocaleString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="py-8 text-center opacity-60">Nothing sent yet.</p>}
        </div>
      </section>
    </div>
  );
}
