import React from "react";
import { ArrowRight } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import { sanitizeImageUrl } from "../../../lib/format";
import { seasonLabel } from "../../store/home/HomeHero";
import Img from "../../ui/Img";

// A 16:9 stand-in for the storefront treatment: hero copy sits bottom-left like HomeHero's
// slides, strip copy is centred like StripBanner. Dark theme means dark art with white text.
export default function BannerPreview({ banner, className = "" }) {
  const { settings } = useShop();
  const dark = banner.theme !== "light";
  const strip = banner.placement === "strip";
  const hasImage = Boolean(sanitizeImageUrl(banner.imageUrl));
  const cta = Boolean(banner.ctaLabel && banner.ctaLink);
  const eyebrow = strip ? settings.tagline || settings.storeName : seasonLabel();

  const button = dark
    ? strip
      ? "border-paper text-paper"
      : "border-paper bg-paper text-ink"
    : strip
      ? "border-ink bg-paper text-ink"
      : "border-ink bg-ink text-paper";

  return (
    <div className={`relative aspect-video overflow-hidden ${dark ? "bg-ink text-paper" : "bg-neutral-100 text-ink"} ${className}`}>
      {hasImage && <Img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <div className={`relative flex h-full p-4 sm:p-5 ${strip ? "items-center justify-center text-center" : "items-end"}`}>
        <div className={`max-w-[88%] ${strip ? "flex flex-col items-center" : ""}`}>
          <p className={`text-[9px] font-medium uppercase tracking-micro ${dark ? "text-neutral-300" : "text-neutral-500"}`}>{eyebrow}</p>
          <p className={`mt-1.5 line-clamp-2 font-display text-[22px] leading-[1.02] tracking-tight sm:text-2xl ${banner.title ? "" : "opacity-50"} ${strip ? "text-balance" : ""}`}>{banner.title || "Untitled banner"}</p>
          {banner.subtitle && <p className={`mt-1.5 line-clamp-2 max-w-xs text-[11px] leading-snug sm:text-xs ${dark ? "text-neutral-300" : "text-neutral-600"}`}>{banner.subtitle}</p>}
          {cta && (
            <span className={`mt-3 inline-flex h-8 items-center gap-1.5 border px-3 text-[9px] font-medium uppercase tracking-micro ${button}`}>
              {banner.ctaLabel}
              <ArrowRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
