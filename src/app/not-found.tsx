import Link from "next/link";
import { Coffee } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-32 text-center">
      <Coffee className="mx-auto h-10 w-10 text-cinnamon" />
      <h1 className="mt-4 text-3xl font-semibold">This cup is empty</h1>
      <p className="mt-2 opacity-70">The page you are looking for does not exist.</p>
      <Link href="/menu" className="mt-6 inline-block rounded-full bg-cinnamon px-6 py-3 text-sm font-semibold text-ivory">
        Back to the menu
      </Link>
    </div>
  );
}
