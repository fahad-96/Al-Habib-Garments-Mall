import React, { useState } from "react";
import { sanitizeImageUrl } from "../../lib/format";

// `sizes` for a product card in the 2 / 3 / 4 column grids (see ProductGrid GRID_CLASS).
export const CARD_SIZES = "(min-width: 1024px) 22vw, (min-width: 768px) 33vw, 50vw";

// Demo photos ship as 900w masters with a 450w "-sm" sibling; nothing else has a known small size.
const LOCAL_PHOTO = /^\/image\/products\/.+\.webp$/;
const srcSetFor = (src) => (LOCAL_PHOTO.test(src) && !src.endsWith("-sm.webp") ? `${src.slice(0, -5)}-sm.webp 450w, ${src} 900w` : undefined);

// Image with a monochrome fallback. Lazy by default; pass eager for above-the-fold.
// `sizes` tells the browser how wide the image renders so it can pick the 450w file for small slots;
// the default (full viewport width) is safe for heroes and galleries, pass CARD_SIZES or similar for smaller ones.
export default function Img({ src, alt = "", className = "", eager = false, fallbackLabel = "", dark = false, sizes = "100vw", ...rest }) {
  const safe = sanitizeImageUrl(src);
  // Load errors for the current src: 1 = retry without srcSet (a missing small file), 2 = give up.
  const [error, setError] = useState({ src: "", level: 0 });
  const level = error.src === safe ? error.level : 0;
  const srcSet = level === 0 ? srcSetFor(safe) : undefined;

  if (!safe || level >= 2) {
    const tone = dark ? "bg-neutral-900 text-neutral-500" : "bg-neutral-100 text-neutral-400";
    // Decorative images (alt="") stay silent; named ones keep their name on the placeholder.
    const a11y = alt ? { role: "img", "aria-label": alt } : { "aria-hidden": "true" };
    return (
      <div className={`flex h-full w-full items-center justify-center ${tone} ${className}`} {...a11y}>
        <span className="font-display text-2xl" aria-hidden="true">
          {fallbackLabel || "AH"}
        </span>
      </div>
    );
  }
  return (
    <img
      src={safe}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setError({ src: safe, level: srcSet ? 1 : 2 })}
      className={className}
      {...rest}
    />
  );
}
