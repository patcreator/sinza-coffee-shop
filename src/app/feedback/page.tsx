import type { Metadata } from "next";
import { FeedbackForm } from "@/components/forms";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Tell us how your visit to Sinza Coffee Shop went.",
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-4xl font-semibold tracking-tight">Your feedback</h1>
      <p className="mt-3 opacity-80">Two minutes of your time makes our coffee better.</p>
      <div className="mt-8 rounded-3xl border border-espresso/12 bg-ivory p-6 dark:border-cream/12 dark:bg-white/5">
        <FeedbackForm />
      </div>
    </div>
  );
}
