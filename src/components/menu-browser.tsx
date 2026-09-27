"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Coffee, Loader2, Plus, Search, X } from "lucide-react";
import { useCart } from "@/components/providers";
import { cn, frw } from "@/lib/utils";

type Item = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: number;
  options: { name: string; price: number }[] | null;
};
type Cat = { id: number; name: string; slug: string; group: string };
type MenuRow = { id: number; name: string; slug: string; description: string | null; createdAt: string };
type Payload = {
  menus: MenuRow[];
  activeMenu: MenuRow | null;
  categories: Cat[];
  groups: { category: Cat; items: Item[] }[];
  count: number;
};

export function MenuBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") ?? "all";
  const menu = params.get("menu") ?? "";
  const q = params.get("q") ?? "";

  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(Boolean(q));
  const [term, setTerm] = useState(q);
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState<number | null>(null);

  useEffect(() => setTerm(q), [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const usp = new URLSearchParams();
    if (category) usp.set("category", category);
    if (menu) usp.set("menu", menu);
    if (q) usp.set("q", q);
    fetch(`/api/menu?${usp.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [category, menu, q]);

  function push(next: Record<string, string | null>) {
    const usp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === "") usp.delete(k);
      else usp.set(k, v);
    });
    router.replace(`/menu?${usp.toString()}`, { scroll: false });
  }

  const selectedCat = useMemo(
    () => data?.categories.find((c) => c.slug === category) ?? null,
    [data, category],
  );

  const activeMenu = data?.menus.find((m) => m.slug === menu) ?? data?.menus[0] ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Menu name + created day */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {activeMenu?.name ?? "Our Menu"}
          </h1>
          <p className="mt-1 text-sm opacity-70">
            {activeMenu?.description ?? "Served all day"}
            {activeMenu?.createdAt
              ? ` · created ${new Date(activeMenu.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}`
              : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data && data.menus.length > 1 && (
            <select
              value={activeMenu?.slug ?? ""}
              onChange={(e) => push({ menu: e.target.value })}
              className="rounded-full border border-espresso/15 bg-ivory px-4 py-2 text-sm dark:border-cream/15 dark:bg-white/5"
            >
              {data.menus.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
          {!searchOpen ? (
            <button
              type="button"
              aria-label="Search the menu"
              onClick={() => setSearchOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-espresso/15 transition hover:bg-espresso/10 dark:border-cream/15 dark:hover:bg-cream/10"
            >
              <Search className="h-4 w-4" />
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                push({ q: term });
              }}
              className="flex items-center gap-2 rounded-full border border-cinnamon bg-ivory px-3 py-1.5 dark:bg-white/5"
            >
              <Search className="h-4 w-4 opacity-60" />
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search items, categories…"
                className="w-44 bg-transparent text-sm outline-none sm:w-64"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setSearchOpen(false);
                  setTerm("");
                  push({ q: null });
                }}
                className="grid h-7 w-7 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Category filter chips — "All" first */}
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => push({ category: "all" })}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm transition",
            category === "all"
              ? "border-cinnamon bg-cinnamon text-ivory"
              : "border-espresso/15 hover:bg-espresso/10 dark:border-cream/15 dark:hover:bg-cream/10",
          )}
        >
          All
        </button>
        {data?.categories.map((c) => (
          <button
            key={c.id}
            onClick={() => push({ category: c.slug })}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition",
              category === c.slug
                ? "border-cinnamon bg-cinnamon text-ivory"
                : "border-espresso/15 hover:bg-espresso/10 dark:border-cream/15 dark:hover:bg-cream/10",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {q && (
        <p className="mt-4 text-sm opacity-70">
          {data?.count ?? 0} result(s) for <strong>“{q}”</strong>
        </p>
      )}

      {loading && (
        <div className="grid place-items-center py-24 opacity-60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!loading && data && data.groups.length === 0 && (
        <p className="py-24 text-center opacity-70">Nothing found. Try another search.</p>
      )}

      {!loading &&
        data?.groups.map(({ category: cat, items }) => (
          <section key={cat.id} id={cat.slug} className="mt-12 scroll-mt-24">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-semibold sm:text-2xl">
                {selectedCat ? selectedCat.name : cat.name}
              </h2>
              <span className="text-xs uppercase tracking-wide opacity-50">{items.length} items</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 rounded-2xl border border-espresso/12 bg-ivory p-3 transition hover:border-cinnamon dark:border-cream/12 dark:bg-white/5"
                >
                  <Link href={`/item/${item.slug}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-espresso to-cinnamon">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <span className="grid h-full place-items-center text-cream/70">
                        <Coffee className="h-5 w-5" />
                      </span>
                    )}
                  </Link>
                  <Link href={`/item/${item.slug}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-xs opacity-60">{item.description}</p>
                    <p className="mt-1 text-sm font-semibold text-cinnamon">{frw(item.price)}</p>
                  </Link>
                  <button
                    type="button"
                    aria-label={`Add ${item.name} to cart`}
                    onClick={() => {
                      add(
                        {
                          itemId: item.id,
                          name: item.name,
                          slug: item.slug,
                          price: item.price,
                          image: item.image,
                          options: [],
                        },
                        1,
                      );
                      setJustAdded(item.id);
                      setTimeout(() => setJustAdded((v) => (v === item.id ? null : v)), 1200);
                    }}
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-full border transition",
                      justAdded === item.id
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-cinnamon text-cinnamon hover:bg-cinnamon hover:text-ivory",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
