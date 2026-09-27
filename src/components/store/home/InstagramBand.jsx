import React, { useEffect, useRef, useState } from "react";
import { BRAND_FILM } from "../../../data/catalog";
import { InstagramIcon } from "../../ui/SocialIcons";
import Reveal from "../../ui/Reveal";
import HeroVideo from "./HeroVideo";

// Plays the film only while the band is on screen.
function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

// The foot of the home page: the shop's bonfire footage from near Tangmarg, full-bleed, behind the
// Instagram handle.
export default function InstagramBand({ settings = {} }) {
  const handle = String(settings.instagram || "").replace(/^@/, "").trim();
  const ref = useRef(null);
  const inView = useInView(ref);
  if (!handle) return null;

  // -mb-20 cancels the footer's top margin so the film runs straight into the dark footer.
  return (
    <section ref={ref} className="relative -mb-20 mt-20 overflow-hidden border-b border-paper/10 bg-ink text-paper lg:mt-28">
      <HeroVideo landscape={BRAND_FILM.videoUrl} portrait={BRAND_FILM.videoUrlPortrait} poster={BRAND_FILM.imageUrl} posterPortrait={BRAND_FILM.imageUrlPortrait} active={inView} />
      <div className="absolute inset-0 bg-ink/55" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/40" aria-hidden="true" />
      <div className="container relative flex min-h-[80svh] items-center justify-center py-20 text-center lg:min-h-[78vh] lg:py-28">
        <Reveal className="flex flex-col items-center">
          <InstagramIcon className="h-5 w-5" />
          <p className="mt-4 text-2xs font-medium uppercase tracking-micro text-neutral-300">Follow along</p>
          <a
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block max-w-full break-words font-display text-4xl leading-none tracking-tight underline-offset-8 transition-colors hover:underline sm:text-6xl lg:text-7xl"
          >
            @{handle}
          </a>
          <p className="mt-5 max-w-sm text-sm text-neutral-200">New arrivals, the odd snow day and evenings like this one near Tangmarg, first on Instagram.</p>
        </Reveal>
      </div>
    </section>
  );
}
