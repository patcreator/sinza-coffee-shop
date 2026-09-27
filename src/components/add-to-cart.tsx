"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers";
import { frw } from "@/lib/utils";

type Props = {
  item: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    options: { name: string; price: number }[];
  };
};

export function AddToCart({ item }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const extras = item.options.filter((o) => picked.includes(o.name));
  const unit = item.price + extras.reduce((s, o) => s + o.price, 0);

  return (
    <div className="mt-6 rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
      {item.options.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold">Add-ons</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.options.map((o) => {
              const active = picked.includes(o.name);
              return (
                <button
                  key={o.name}
                  type="button"
                  onClick={() =>
                    setPicked((p) => (active ? p.filter((x) => x !== o.name) : [...p, o.name]))
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-cinnamon bg-cinnamon text-ivory"
                      : "border-espresso/20 dark:border-cream/20"
                  }`}
                >
                  {o.name} (+{frw(o.price)})
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-espresso/15 p-1 dark:border-cream/15">
          <button type="button" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-8 w-8 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button type="button" aria-label="Increase" onClick={() => setQty((q) => Math.min(50, q + 1))} className="grid h-8 w-8 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            add(
              { itemId: item.id, name: item.name, slug: item.slug, price: item.price, image: item.image, options: extras },
              qty,
            );
            setDone(true);
            setTimeout(() => setDone(false), 1800);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-cinnamon px-6 py-3 text-sm font-semibold text-ivory transition hover:opacity-90"
        >
          {done ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {done ? "Added" : `Add to cart · ${frw(unit * qty)}`}
        </button>

        <Link href="/cart" className="text-sm font-semibold text-cinnamon underline-offset-4 hover:underline">
          Go to cart
        </Link>
      </div>
    </div>
  );
}
