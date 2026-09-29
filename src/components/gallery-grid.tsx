"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Video from "yet-another-react-lightbox/plugins/video";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";

export type GalleryItem = {
  id: number;
  title: string;
  description: string | null;
  url: string;
  kind: string;
  type: string;
  takenAt: string | null; // pass as ISO string from the server
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(-1);

  const slides = items.map((g) =>
    g.kind === "video"
      ? {
          type: "video" as const,
          title: g.title,
          description: g.description ?? undefined,
          sources: [{ src: g.url, type: "video/mp4" }],
        }
      : {
          src: g.url,
          alt: g.title,
          title: g.title,
          description: g.description ?? undefined,
        }
  );

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((g, i) => (
          <figure
            key={g.id}
            className="group overflow-hidden rounded-3xl border border-espresso/12 bg-ivory dark:border-cream/12 dark:bg-white/5"
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Open ${g.title}`}
              className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-espresso/10"
            >
              {g.kind === "video" ? (
                <>
                  <video
                    className="h-full w-full object-cover"
                    src={g.url}
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-espresso shadow-lg transition group-hover:scale-110">
                      <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-current" aria-hidden>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                </>
              ) : (
                <Image
                  src={g.url}
                  alt={g.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
                />
              )}
            </button>
            <figcaption className="p-4">
              <h2 className="font-semibold">{g.title}</h2>
              <p className="mt-1 text-sm opacity-70">{g.description}</p>
              <p className="mt-2 text-xs opacity-50">
                {g.type}
                {g.takenAt ? ` · ${formatDate(g.takenAt)}` : ""}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Zoom, Slideshow, Thumbnails, Captions, Counter, Video, Fullscreen]}
        zoom={{
          maxZoomPixelRatio: 4,
          scrollToZoom: true,
          doubleClickMaxStops: 2,
        }}
        slideshow={{ autoplay: false, delay: 3500 }}
        thumbnails={{ position: "bottom", width: 88, height: 60, gap: 8 }}
        captions={{ descriptionTextAlign: "center" }}
        counter={{ container: { style: { top: 0, left: 0 } } }}
        carousel={{ finite: false, preload: 2 }}
        animation={{ fade: 250, swipe: 300 }}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  );
}