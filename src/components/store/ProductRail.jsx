import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import SectionHeading from "../ui/SectionHeading";
import { scrollBehavior } from "../../lib/motion";

const CARD_WIDTH = "w-[62vw] sm:w-[40vw] md:w-[30vw] lg:w-[22vw] xl:w-[19vw]";
// Matches CARD_WIDTH so the browser picks the small photo where a card is small.
const CARD_SIZES = "(min-width: 1280px) 19vw, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, (min-width: 640px) 40vw, 62vw";

// Horizontal product rail. Rails sit below the fold on every page today, so their images stay lazy;
// pass `eager` only for a rail that is visible on load (it then eager-loads the first two cards).
// When overriding cardWidth, pass matching `sizes` too.
export default function ProductRail({ products = [], eyebrow, title, description, to, linkLabel, className = "", eager = false, cardWidth = CARD_WIDTH, sizes = CARD_SIZES }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return undefined;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [products.length]);

  const scrollBy = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: scrollBehavior() });
  };

  if (!products.length) return null;
  return (
    <section className={className}>
      {(title || eyebrow) && (
        <div className="container flex items-end justify-between gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} to={to} linkLabel={linkLabel} className="flex-1" />
          <div className="hidden shrink-0 gap-2 lg:flex">
            <button type="button" onClick={() => scrollBy(-1)} disabled={!canLeft} className="flex h-10 w-10 items-center justify-center border border-neutral-300 hover:border-ink disabled:opacity-30" aria-label="Scroll left">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} disabled={!canRight} className="flex h-10 w-10 items-center justify-center border border-neutral-300 hover:border-ink disabled:opacity-30" aria-label="Scroll right">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <div ref={ref} className="rail mt-8 px-4 scroll-pl-4 sm:px-6 sm:scroll-pl-6 lg:px-10 lg:scroll-pl-10 xl:px-12 xl:scroll-pl-12 2xl:mx-auto 2xl:max-w-[1440px]">
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} eager={eager && i < 2} className={cardWidth} sizes={sizes} />
        ))}
      </div>
    </section>
  );
}
