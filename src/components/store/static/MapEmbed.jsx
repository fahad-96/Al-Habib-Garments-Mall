import React from "react";
import { MapPin } from "lucide-react";

// Google Maps embed with a grey placeholder behind it, so the box reads as a map even before (or without) the frame loading.
export default function MapEmbed({ query, className = "" }) {
  const clean = String(query || "").trim();
  const src = clean ? `https://www.google.com/maps?q=${encodeURIComponent(clean)}&output=embed` : "";
  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 ${className}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-400" aria-hidden="true">
        <MapPin className="h-6 w-6" strokeWidth={1.25} />
        <span className="text-2xs font-medium uppercase tracking-micro">{clean || "Map"}</span>
      </div>
      {src && (
        <iframe
          src={src}
          title={`Map showing ${clean}`}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0 grayscale"
        />
      )}
    </div>
  );
}
