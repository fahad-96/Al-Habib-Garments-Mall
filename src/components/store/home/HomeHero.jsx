import React, { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Pause, Play } from "lucide-react";
import { DEPARTMENTS } from "../../../data/catalog";
import { sanitizeImageUrl } from "../../../lib/format";
import Button from "../../ui/Button";
import Img from "../../ui/Img";

const INTERVAL_MS = 6000;

// Fashion calendars run Autumn/Winter from September to February.
export const seasonLabel = (date = new Date()) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= 8) return `Autumn/Winter ${year}`;
  if (month <= 1) return `Autumn/Winter ${year - 1}`;
  return `Spring/Summer ${year}`;
};

const pad = (n) => String(n).padStart(2, "0");

function Slide({ banner, active, index, count, eager, eyebrow }) {
  const dark = banner.theme !== "light";
  const hasImage = Boolean(sanitizeImageUrl(banner.imageUrl));
  const cta = banner.ctaLabel && banner.ctaLink;
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-1000 ease-soft ${active ? "opacity-100" : "pointer-events-none opacity-0"} ${dark ? "bg-ink" : "bg-neutral-100"}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}`}
      aria-hidden={!active}
    >
      {hasImage && (
        <Img
          src={banner.imageUrl}
          alt=""
          eager={eager}
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[7000ms] ease-linear ${active ? "scale-100" : "scale-[1.04]"}`}
        />
      )}
      <div className="relative flex h-full items-end">
        <div className="container pb-20 pt-28 sm:pb-24 lg:pb-28">
          <div className={`max-w-3xl transition-[opacity,transform] duration-700 ease-soft ${active ? "translate-y-0 opacity-100 delay-300" : "translate-y-3 opacity-0"}`}>
            <p className={`text-2xs font-medium uppercase tracking-micro ${dark ? "text-neutral-300" : "text-neutral-500"}`}>{eyebrow}</p>
            <p className={`mt-4 line-clamp-2 font-display text-[2.6rem] leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl ${dark ? "text-paper" : "text-ink"}`}>{banner.title}</p>
            {banner.subtitle && <p className={`mt-5 max-w-md text-sm leading-relaxed sm:text-base ${dark ? "text-neutral-300" : "text-neutral-600"}`}>{banner.subtitle}</p>}
            {cta && (
              <Button to={banner.ctaLink} variant={dark ? "inverse" : "primary"} className="mt-8" tabIndex={active ? 0 : -1}>
                {banner.ctaLabel}
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypographicHero({ settings }) {
  return (
    <section className="border-b border-line">
      <div className="container flex min-h-[64svh] flex-col justify-end py-16 lg:min-h-[72vh] lg:py-24">
        <p className="eyebrow">{settings.tagline || seasonLabel()}</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[1.02] tracking-tight text-balance sm:text-7xl lg:text-8xl">Dressed for the valley.</h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-neutral-600 sm:text-base">
          Kurtas for Friday, pherans for the first snow, suits for the wedding season. Every order is confirmed personally on WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {DEPARTMENTS.map((d, i) => (
            <Button key={d.key} to={`/shop/${d.key}`} variant={i === 0 ? "primary" : "secondary"}>
              Shop {d.name.toLowerCase()}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomeHero({ banners = [], settings = {} }) {
  const reduce = useReducedMotion();
  const count = banners.length;
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [stopped, setStopped] = useState(false);
  const current = count ? index % count : 0;
  const paused = stopped || hover || focus || hidden || Boolean(reduce);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(timer);
    // `current` restarts the timer after a manual jump so the next slide gets a full interval.
  }, [count, paused, current]);

  if (!count) return <TypographicHero settings={settings} />;

  const active = banners[current];
  const dark = active.theme !== "light";
  const eyebrow = seasonLabel();
  const dotOn = dark ? "bg-paper" : "bg-ink";
  const dotOff = dark ? "bg-paper/40 hover:bg-paper/70" : "bg-ink/30 hover:bg-ink/60";

  return (
    <section
      className="relative min-h-[76svh] overflow-hidden lg:min-h-[80vh]"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
      }}
    >
      <h1 className="sr-only">{settings.storeName || "Al Habib Garments Mall"}</h1>
      {banners.map((b, i) => (
        <Slide key={b.id || i} banner={b} active={i === current} index={i} count={count} eager={i === 0} eyebrow={eyebrow} />
      ))}

      {count > 1 && (
        <div className={`absolute bottom-5 right-3 z-10 flex items-center gap-1 sm:right-5 lg:bottom-9 lg:right-10 ${dark ? "text-paper" : "text-ink"}`}>
          <span className="mr-2 hidden text-2xs tabular-nums tracking-micro sm:inline">
            {pad(current + 1)} / {pad(count)}
          </span>
          <div className="flex items-center" role="tablist" aria-label="Choose slide">
            {banners.map((b, i) => (
              <button
                key={b.id || i}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}: ${b.title}`}
                onClick={() => setIndex(i)}
                className="flex h-10 w-7 items-center justify-center"
              >
                <span className={`block h-1.5 rounded-full transition-all duration-500 ease-soft ${i === current ? `w-6 ${dotOn}` : `w-1.5 ${dotOff}`}`} />
              </button>
            ))}
          </div>
          {!reduce && (
            <button
              type="button"
              onClick={() => setStopped((s) => !s)}
              className="ml-1 flex h-10 w-10 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
              aria-label={stopped ? "Play slideshow" : "Pause slideshow"}
              aria-pressed={stopped}
            >
              {stopped ? <Play className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
