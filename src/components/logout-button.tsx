"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "logout" }),
        });
        router.push("/");
        router.refresh();
      }}
      className="inline-flex items-center gap-2 rounded-full border border-espresso/20 px-5 py-2.5 text-sm dark:border-cream/20"
    >
      <LogOut className="h-4 w-4" /> Sign out
    </button>
  );
}
