import { Suspense } from "react";
import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu-browser";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Coffee, tea, frappes, fresh juice, Rolex, burgers, chicken, famous chips, cocktails and more at Sinza Coffee Shop, Gisozi (Kwa Gakire), Kigali.",
};

export const dynamic = "force-dynamic";

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center opacity-60">Loading menu…</div>}>
      <MenuBrowser />
    </Suspense>
  );
}
