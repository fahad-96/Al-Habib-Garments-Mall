import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import SectionHeading from "../ui/SectionHeading";

export default function ProductRail({ products = [], eyebrow, title, description, to, linkLabel, className = "", cardWidth = "w-[62vw] sm:w-[40vw] md:w-[30vw] lg:w-[22vw] xl:w-[19vw]" }) {
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
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (!products.length) return null;
  return (
    <section className={className}>
      {(title || eyebrow) && (
        <div className="container flex items-end justify-between gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} to={to} linkLabel={linkLabel} className="flex-1" />
          <div className="hidden shrink-0 gap-2 lg:flex">
            <button type="button" onClick={() => scrollBy(-1)} disabled={!canLeft} className="flex h-10 w-10 items-center justify-center border border-neutral-300 hover:border-ink disabled:opacity-30" aria-label="Scroll left">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} disabled={!canRight} className="flex h-10 w-10 items-center justify-center border border-neutral-300 hover:border-ink disabled:opacity-30" aria-label="Scroll right">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <div ref={ref} className="rail mt-8 px-4 sm:px-6 lg:px-10 xl:px-12 2xl:mx-auto 2xl:max-w-[1440px]">
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} eager={i < 2} className={cardWidth} />
        ))}
      </div>
    </section>
  );
}
