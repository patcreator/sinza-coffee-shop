"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Coffee,
  Loader2,
  Minus,
  Plus,
  QrCode,
  Trash2,
  UtensilsCrossed,
  ArrowLeft,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useCart } from "@/components/providers";
import { frw, WHATSAPP_NUMBER } from "@/lib/utils";
import { inputClass, buttonClass } from "@/components/forms";

type Waiter = { id: number; name: string; shift: string | null };

export default function CartPage() {
  const { lines, setQty, remove, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const [mode, setMode] = useState<"" | "waiter" | "restaurant" | "whatsapp">("");
  const [scanPrompt, setScanPrompt] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [tableLabel, setTableLabel] = useState("");
  const [waiterId, setWaiterId] = useState<number | null>(null);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  const whatsappText = `*Sinza Coffee Shop Order*\n\nI would like to place this order:\n\n${lines
    .map(
      (l) =>
        `${l.quantity} × ${l.name}${l.options.length ? ` (${l.options.map((o) => o.name).join(", ")})` : ""} — ${frw(
          (l.price + l.options.reduce((s, o) => s + o.price, 0)) * l.quantity,
        )}`,
    )
    .join("\n")}\n\nSubtotal: ${frw(subtotal)}`;

  async function startScan() {
    setScanError("");
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner as unknown as { stop: () => Promise<void>; clear: () => void };
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decoded: string) => {
          await scanner.stop().catch(() => {});
          scanner.clear();
          setScanning(false);
          await verifyToken(decoded);
        },
        () => {},
      );
    } catch {
      setScanning(false);
      setScanError("Could not open the camera. You can type the table code printed on the QR instead.");
    }
  }

  async function verifyToken(token: string) {
    const res = await fetch(`/api/waiters?token=${encodeURIComponent(token)}`);
    const json = await res.json();
    if (!res.ok) {
      setScanError(json.error || "QR code not recognised.");
      return;
    }
    setWaiters(json.waiters);
    setTableLabel(json.table.label);
    setScanPrompt(false);
  }

  async function placeOrder(channel: "waiter" | "restaurant" | "whatsapp") {
    if (!lines.length) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ itemId: l.itemId, quantity: l.quantity, options: l.options })),
          channel,
          waiterId,
          tableLabel: tableLabel || null,
          ...form,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not place the order");
      clear();
      if (channel === "whatsapp") {
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`${whatsappText}\n\nOrder code: ${json.order.code}`)}`,
          "_blank",
        );
      }
      router.push(`/order/${json.order.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return <div className="py-32 text-center opacity-60">Loading cart…</div>;

  if (!lines.length)
    return (
      <div className="mx-auto max-w-2xl px-4 py-28 text-center">
        <Coffee className="mx-auto h-10 w-10 text-cinnamon" />
        <h1 className="mt-4 text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 opacity-70">Add a coffee, a Rolex or your favourite cocktail.</p>
        <Link href="/menu" className={`${buttonClass} mt-6`}>
          Browse the menu
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/menu" className="inline-flex items-center gap-1 text-sm opacity-70 hover:opacity-100">
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Your order</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {lines.map((l) => {
            const unit = l.price + l.options.reduce((s, o) => s + o.price, 0);
            return (
              <div
                key={`${l.itemId}-${l.options.map((o) => o.name).join("|")}`}
                className="flex items-center gap-3 rounded-2xl border border-espresso/12 bg-ivory p-3 dark:border-cream/12 dark:bg-white/5"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-espresso to-cinnamon">
                  {l.image ? (
                    <Image src={l.image} alt={l.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <span className="grid h-full place-items-center text-cream/70">
                      <Coffee className="h-5 w-5" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{l.name}</p>
                  {l.options.length > 0 && (
                    <p className="truncate text-xs opacity-60">{l.options.map((o) => o.name).join(", ")}</p>
                  )}
                  <p className="text-sm text-cinnamon">{frw(unit)}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-espresso/15 p-1 dark:border-cream/15">
                  <button aria-label="Decrease" onClick={() => setQty(l.itemId, l.quantity - 1)} className="grid h-7 w-7 place-items-center rounded-full">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm">{l.quantity}</span>
                  <button aria-label="Increase" onClick={() => setQty(l.itemId, l.quantity + 1)} className="grid h-7 w-7 place-items-center rounded-full">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button aria-label="Remove" onClick={() => remove(l.itemId)} className="grid h-9 w-9 place-items-center rounded-full text-red-600 hover:bg-red-600/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-3xl border border-espresso/12 bg-ivory p-6 dark:border-cream/12 dark:bg-white/5">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Subtotal</span>
            <span>{frw(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs opacity-60">An account is optional — order as a guest any time.</p>

          <div className="mt-5 space-y-3">
            <input placeholder="Your name (optional)" className={inputClass} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            <input type="email" placeholder="Email for the receipt (optional)" className={inputClass} value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
            <input placeholder="Phone (optional)" className={inputClass} value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
            <textarea rows={2} placeholder="Notes for the kitchen" className={inputClass} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide opacity-70">Order now — choose how</h3>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMode("waiter");
                if (!waiters.length) setScanPrompt(true);
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-espresso/15 p-3 text-left text-sm transition hover:border-cinnamon dark:border-cream/15"
            >
              <QrCode className="h-5 w-5 text-cinnamon" />
              <span>
                <strong className="block">1 · Choose your waiter</strong>
                <span className="opacity-70">Scan the table QR code first</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode("restaurant")}
              className="flex w-full items-center gap-3 rounded-2xl border border-espresso/15 p-3 text-left text-sm transition hover:border-cinnamon dark:border-cream/15"
            >
              <UtensilsCrossed className="h-5 w-5 text-cinnamon" />
              <span>
                <strong className="block">2 · Order direct to the restaurant</strong>
                <span className="opacity-70">Pay online or after eating</span>
              </span>
            </button>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 rounded-2xl border border-espresso/15 p-3 text-left text-sm transition hover:border-cinnamon dark:border-cream/15"
            >
              <FaWhatsapp className="h-5 w-5 text-[#25D366]" />
              <span>
                <strong className="block">3 · Send the order to WhatsApp</strong>
                <span className="opacity-70">Opens a ready-made message</span>
              </span>
            </a>
          </div>

          {mode === "waiter" && waiters.length > 0 && (
            <div className="mt-5 rounded-2xl border border-cinnamon/40 p-4">
              <p className="text-sm font-semibold">{tableLabel} · pick your waiter</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {waiters.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWaiterId(w.id)}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      waiterId === w.id ? "border-cinnamon bg-cinnamon text-ivory" : "border-espresso/15 dark:border-cream/15"
                    }`}
                  >
                    {w.name}
                    <span className="block text-[10px] opacity-70">{w.shift}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {(mode === "restaurant" || (mode === "waiter" && waiterId)) && (
            <button
              disabled={submitting}
              onClick={() => placeOrder(mode === "waiter" ? "waiter" : "restaurant")}
              className={`${buttonClass} mt-5 w-full`}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Place order · {frw(subtotal)}
            </button>
          )}

          <button onClick={clear} className="mt-3 w-full text-xs opacity-60 hover:opacity-100">
            Clear cart
          </button>
        </aside>
      </div>

      {/* QR gate modal */}
      {scanPrompt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-ivory p-6 dark:bg-[#1e0e06]">
            <h2 className="text-lg font-semibold">Scan the Restaurant Menu</h2>
            <p className="mt-2 text-sm opacity-75">
              To choose a waiter or waitress, please scan the restaurant&apos;s menu QR code. This helps ensure that
              waiter/waitress requests are only made by customers who are physically inside the restaurant.
            </p>

            <div id="qr-reader" className={`mt-4 overflow-hidden rounded-2xl ${scanning ? "block" : "hidden"}`} />

            {scanError && <p className="mt-3 text-sm text-red-600">{scanError}</p>}

            <div className="mt-4 flex flex-col gap-2">
              <button onClick={startScan} className={buttonClass}>
                <Camera className="h-4 w-4" /> OK, Scan Menu
              </button>
              <input
                placeholder="or type the table code e.g. SINZA-TABLE-01"
                className={inputClass}
                onKeyDown={(e) => {
                  if (e.key === "Enter") verifyToken((e.target as HTMLInputElement).value);
                }}
              />
              <button
                onClick={() => {
                  setScanPrompt(false);
                  setMode("");
                }}
                className="rounded-full border border-espresso/20 px-5 py-2.5 text-sm dark:border-cream/20"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
