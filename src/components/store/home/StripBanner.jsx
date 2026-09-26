import React from "react";
import { ArrowRight } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import { sanitizeImageUrl } from "../../../lib/format";
import Button from "../../ui/Button";
import Img from "../../ui/Img";
import Reveal from "../../ui/Reveal";

export default function StripBanner() {
  const { banners, settings } = useShop();
  const strip = [...banners].filter((b) => b.placement === "strip" && b.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))[0];
  if (!strip) return null;

  const dark = strip.theme !== "light";
  const hasImage = Boolean(sanitizeImageUrl(strip.imageUrl));
  const cta = strip.ctaLabel && strip.ctaLink;

  return (
    <section className={`relative mt-20 overflow-hidden lg:mt-28 ${dark ? "bg-ink text-paper" : "bg-neutral-100 text-ink"}`}>
      {hasImage && <Img src={strip.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <div className="container relative flex min-h-[400px] flex-col items-center justify-center py-20 text-center lg:min-h-[480px] lg:py-24">
        <Reveal className="flex flex-col items-center">
          <p className={dark ? "eyebrow-dark" : "eyebrow"}>{settings.tagline || settings.storeName}</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] tracking-tight text-balance sm:text-5xl lg:text-6xl">{strip.title}</h2>
          {strip.subtitle && <p className={`mt-5 max-w-md text-sm leading-relaxed sm:text-base ${dark ? "text-neutral-300" : "text-neutral-600"}`}>{strip.subtitle}</p>}
          {cta && (
            <Button to={strip.ctaLink} variant={dark ? "inverse-outline" : "secondary"} className="mt-8">
              {strip.ctaLabel}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </Button>
          )}
        </Reveal>
      </div>
    </section>
  );
}
