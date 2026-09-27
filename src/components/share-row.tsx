"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { FaFacebookF, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title}\n${url}`)}`, icon: FaWhatsapp },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, icon: FaXTwitter },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, icon: FaFacebookF },
  ];

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
      <span className="inline-flex items-center gap-1 opacity-70">
        <Share2 className="h-4 w-4" /> Share
      </span>
      {links.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Share on ${label}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-espresso/20 transition hover:bg-espresso/10 dark:border-cream/20 dark:hover:bg-cream/10"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={async () => {
          try {
            if (navigator.share) await navigator.share({ title, url });
            else {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }
          } catch {
            /* dismissed */
          }
        }}
        className="inline-flex items-center gap-2 rounded-full border border-espresso/20 px-3 py-2 transition hover:bg-espresso/10 dark:border-cream/20 dark:hover:bg-cream/10"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
