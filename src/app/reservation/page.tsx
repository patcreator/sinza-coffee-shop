import type { Metadata } from "next";
import { ReservationForm } from "@/components/forms";
import { getSettings } from "@/lib/settings";
import { ShareRow } from "@/components/share-row";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reservation",
  description: "Reserve your table at Sinza Coffee Shop, Gisozi (Kwa Gakire), Kigali.",
};

export const dynamic = "force-dynamic";

export default async function ReservationPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-semibold tracking-tight">Reserve a table</h1>
      <p className="mt-3 opacity-80">
        Tell us when you are coming and we will keep the best seat for you. {s.openingHours}.
      </p>
      <div className="mt-8 rounded-3xl border border-espresso/12 bg-ivory p-6 dark:border-cream/12 dark:bg-white/5">
        <ReservationForm />
      </div>
      <ShareRow url={`${SITE_URL}/reservation`} title="Book a table at Sinza Coffee Shop" />
    </div>
  );
}
