"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Smartphone, Wallet } from "lucide-react";
import { frw } from "@/lib/utils";
import { inputClass, buttonClass } from "@/components/forms";

export function PayPanel({
  code,
  total,
  paymentStatus,
}: {
  code: string;
  total: number;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"momo" | "airtel" | "card">("momo");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  if (paymentStatus === "paid") {
    return (
      <p className="mt-6 rounded-2xl bg-green-600/10 p-4 text-sm font-semibold text-green-700 dark:text-green-400">
        Payment received — enjoy your order ☕
      </p>
    );
  }

  async function pay() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, method, phone }),
      });
      const json = await res.json();
      setMessage(json.message || json.error || "");
      setReference(json.payment?.reference || "");
      if (json.redirectUrl && method === "card" && !json.redirectUrl.includes("sandbox=1")) {
        window.location.href = json.redirectUrl;
      }
    } finally {
      setLoading(false);
    }
  }

  async function confirmSandbox() {
    await fetch("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, status: "COMPLETED" }),
    });
    router.refresh();
  }

  return (
    <div className="mt-6 rounded-2xl border border-espresso/12 p-5 dark:border-cream/12">
      <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">Pay now — or after eating</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { id: "momo", label: "MTN MoMo", icon: Smartphone },
          { id: "airtel", label: "Airtel Money", icon: Wallet },
          { id: "card", label: "Card", icon: CreditCard },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMethod(id as typeof method)}
            className={`rounded-xl border px-3 py-3 text-xs font-medium transition ${
              method === id ? "border-cinnamon bg-cinnamon text-ivory" : "border-espresso/15 dark:border-cream/15"
            }`}
          >
            <Icon className="mx-auto mb-1 h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {method !== "card" && (
        <input
          className={`${inputClass} mt-3`}
          placeholder="Mobile money number e.g. 0788123456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      )}

      <button onClick={pay} disabled={loading} className={`${buttonClass} mt-3 w-full`}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Pay {frw(total)}
      </button>

      {message && <p className="mt-3 text-sm opacity-80">{message}</p>}
      {reference && (
        <button onClick={confirmSandbox} className="mt-2 text-xs underline opacity-70 hover:opacity-100">
          Simulate provider confirmation (sandbox)
        </button>
      )}

      <p className="mt-4 text-xs opacity-60">
        Paying later? Just tell your waiter — this order stays open and can be settled at the counter.
      </p>
    </div>
  );
}
