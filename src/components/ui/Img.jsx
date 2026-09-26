import React, { useState } from "react";
import { sanitizeImageUrl } from "../../lib/format";

// Image with a monochrome fallback. Lazy by default; pass eager for above-the-fold.
export default function Img({ src, alt = "", className = "", eager = false, fallbackLabel = "", ...rest }) {
  const safe = sanitizeImageUrl(src);
  const [failed, setFailed] = useState(false);
  if (!safe || failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400 ${className}`} role="img" aria-label={alt || "No image"}>
        <span className="font-display text-2xl">{fallbackLabel || "AH"}</span>
      </div>
    );
  }
  return <img src={safe} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} className={className} {...rest} />;
}
