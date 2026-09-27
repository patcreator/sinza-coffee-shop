"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { inputClass, buttonClass } from "@/components/forms";

function SignInInner() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ loading: boolean; sent?: boolean; devLink?: string; error?: string }>({
    loading: false,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ loading: true });
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-link", email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setState({ loading: false, sent: true, devLink: json.devLink });
    } catch (err) {
      setState({ loading: false, error: err instanceof Error ? err.message : "Failed" });
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in / Register</h1>
      <p className="mt-2 text-sm opacity-75">
        We email you a secure activation link — no password to remember. Accounts are optional: you can always order as
        a guest.
      </p>

      {params.get("error") === "expired" && (
        <p className="mt-4 rounded-xl bg-red-600/10 p-3 text-sm text-red-600">That link expired. Request a new one.</p>
      )}

      {state.sent ? (
        <div className="mt-6 rounded-3xl border border-espresso/12 bg-ivory p-6 dark:border-cream/12 dark:bg-white/5">
          <Mail className="h-6 w-6 text-cinnamon" />
          <h2 className="mt-3 font-semibold">Check your inbox</h2>
          <p className="mt-1 text-sm opacity-75">We sent an activation link to {email}.</p>
          {state.devLink && (
            <a href={state.devLink} className="mt-3 block break-all text-xs text-cinnamon underline">
              Dev mode link: {state.devLink}
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            required
            type="email"
            placeholder="you@email.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className={`${buttonClass} w-full`} disabled={state.loading}>
            {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Email me a link
          </button>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        </form>
      )}

      <p className="mt-6 text-xs opacity-60">
        Clerk SSO can be enabled by setting NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY — see the README.
      </p>
      <Link href="/menu" className="mt-4 inline-block text-sm font-semibold text-cinnamon">
        Continue as guest →
      </Link>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center opacity-60">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}
