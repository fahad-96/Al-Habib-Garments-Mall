import React from "react";
import { MapPin } from "lucide-react";

// Google Maps embed with a grey placeholder behind it, so the box reads as a map even before (or without) the frame loading.
export default function MapEmbed({ query, className = "" }) {
  const clean = String(query || "").trim();
  const src = clean ? `https://www.google.com/maps?q=${encodeURIComponent(clean)}&output=embed` : "";
  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 ${className}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-500" aria-hidden="true">
        <MapPin className="h-6 w-6" strokeWidth={1.25} />
        <span className="text-2xs font-medium uppercase tracking-micro">{clean || "Map"}</span>
      </div>
      {/* Sandboxed: scripts and same-origin let the map run, popups let "View larger map" open Google Maps in a new tab.
          Nothing else (top navigation, forms, downloads) is granted, and only the site's origin is sent as the referrer. */}
      {src && (
        <iframe
          src={src}
          title={`Map showing ${clean}`}
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          className="absolute inset-0 h-full w-full border-0 grayscale"
        />
      )}
    </div>
  );
}
