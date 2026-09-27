"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";

const input =
  "w-full rounded-xl border border-espresso/15 bg-ivory/80 px-4 py-2.5 text-sm text-bean outline-none transition placeholder:text-bean/40 focus:border-cinnamon dark:border-cream/15 dark:bg-white/5 dark:text-cream dark:placeholder:text-cream/40";
const button =
  "inline-flex items-center justify-center gap-2 rounded-full bg-cinnamon px-5 py-2.5 text-sm font-semibold text-ivory transition hover:opacity-90 disabled:opacity-60";

function useSubmit() {
  const [state, setState] = useState<{ loading: boolean; ok?: string; error?: string }>({ loading: false });
  async function submit(payload: Record<string, unknown>, okMessage: string, reset?: () => void) {
    setState({ loading: true });
    try {
      const res = await fetch("/api/engage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setState({ loading: false, ok: okMessage });
      reset?.();
    } catch (err) {
      setState({ loading: false, error: err instanceof Error ? err.message : "Failed" });
    }
  }
  return { state, submit };
}

function Status({ state }: { state: { ok?: string; error?: string } }) {
  if (state.ok)
    return (
      <p className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4" /> {state.ok}
      </p>
    );
  if (state.error)
    return (
      <p className="mt-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
        <AlertCircle className="h-4 w-4" /> {state.error}
      </p>
    );
  return null;
}

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const { state, submit } = useSubmit();
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("weekly");

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        submit({ kind: "newsletter", email, frequency }, "You're subscribed ☕", () => setEmail(""));
      }}
    >
      <div className={compact ? "flex flex-col gap-2" : "flex flex-col gap-3 sm:flex-row"}>
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={input}
        />
        <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={input}>
          <option value="weekly">Weekly digest</option>
          <option value="daily">Daily menu</option>
        </select>
        <button className={button} disabled={state.loading}>
          {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Subscribe
        </button>
      </div>
      <Status state={state} />
    </form>
  );
}

export function ContactForm() {
  const { state, submit } = useSubmit();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ kind: "contact", ...form }, "Message sent — we'll reply soon!", () =>
          setForm({ name: "", email: "", subject: "", message: "" }),
        );
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input required placeholder="Your name" className={input} value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input required type="email" placeholder="Email" className={input} value={form.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <input placeholder="Subject" className={input} value={form.subject} onChange={(e) => set("subject", e.target.value)} />
      <textarea required rows={5} placeholder="How can we help?" className={input} value={form.message} onChange={(e) => set("message", e.target.value)} />
      <button className={button} disabled={state.loading}>
        {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send message
      </button>
      <Status state={state} />
    </form>
  );
}

export function ReservationForm() {
  const { state, submit } = useSubmit();
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", time: "19:00", guests: 2, note: "" });
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ kind: "reservation", ...form }, "Table request received — we'll confirm shortly.");
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input required placeholder="Full name" className={input} value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input required placeholder="Phone (+250…)" className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <input type="email" placeholder="Email (optional)" className={input} value={form.email} onChange={(e) => set("email", e.target.value)} />
        <input type="number" min={1} max={40} className={input} value={form.guests} onChange={(e) => set("guests", Number(e.target.value))} />
        <input required type="date" className={input} value={form.date} onChange={(e) => set("date", e.target.value)} />
        <input required type="time" className={input} value={form.time} onChange={(e) => set("time", e.target.value)} />
      </div>
      <textarea rows={3} placeholder="Occasion, seating preference…" className={input} value={form.note} onChange={(e) => set("note", e.target.value)} />
      <button className={button} disabled={state.loading}>
        {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Request table
      </button>
      <Status state={state} />
    </form>
  );
}

export function FeedbackForm() {
  const { state, submit } = useSubmit();
  const [form, setForm] = useState({ name: "", email: "", rating: 5, message: "" });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ kind: "feedback", ...form }, "Thank you for the feedback!");
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input placeholder="Name (optional)" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" placeholder="Email (optional)" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <select className={input} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>
            {r} / 5
          </option>
        ))}
      </select>
      <textarea required rows={4} placeholder="Tell us about your visit" className={input} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      <button className={button} disabled={state.loading}>
        {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send feedback
      </button>
      <Status state={state} />
    </form>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium opacity-80">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = input;
export const buttonClass = button;
