import Link from "next/link";
import { UtensilsCrossed, CalendarDays } from "lucide-react";

const Hero = ({ s }: { s: any }) => {
  return (
    <section className="relative isolate flex h-screen min-h-[640px] items-center overflow-hidden">
      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={s.heroPoster}
      >
        <source src={s.heroVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 text-cream sm:px-10 lg:px-16">
        <p className="animate-fade-up text-[11px] uppercase tracking-[0.35em] text-cream/70">
          Gisozi · Kigali
        </p>

        <h1 className="animate-fade-up mt-6 max-w-2xl font-serif text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          {s.siteName}
        </h1>

        <div className="animate-fade-up mt-6 h-px w-16 bg-cinnamon" />

        <p className="animate-fade-up mt-6 max-w-md text-base font-light leading-relaxed text-cream/80 sm:text-lg">
          A cozy Kigali café by gospel artist Jado Sinza and Esther. Coffee and
          good bites.
        </p>

        <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-full bg-cinnamon px-8 py-3.5 text-sm font-medium tracking-wide text-ivory transition hover:brightness-110"
          >
            <UtensilsCrossed className="h-4 w-4" />
            View the menu
          </Link>

          <Link
            href="/reservation"
            className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-cream/90 transition hover:text-cream"
          >
            <CalendarDays className="h-4 w-4" />
            Reserve a table
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-cream/60">
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-cream/60 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;