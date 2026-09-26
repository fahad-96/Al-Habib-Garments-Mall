import React from "react";
import { Check } from "lucide-react";

// Colour swatch. Selected state is a black ring; sold-out gets a diagonal strike.
export default function Swatch({ hex, name, selected = false, soldOut = false, size = "md", onClick, as = "button" }) {
  const px = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-9 w-9" : "h-7 w-7";
  const Tag = as;
  const light = isLight(hex);
  return (
    <Tag
      type={as === "button" ? "button" : undefined}
      onClick={onClick}
      title={name}
      aria-label={name}
      aria-pressed={as === "button" ? selected : undefined}
      className={`relative inline-flex ${px} shrink-0 items-center justify-center rounded-full border transition-all ${selected ? "ring-1 ring-ink ring-offset-2" : ""} ${light ? "border-neutral-300" : "border-transparent"} ${soldOut ? "opacity-60" : ""}`}
      style={{ backgroundColor: hex }}
    >
      {selected && size !== "sm" && <Check className={`h-3.5 w-3.5 ${light ? "text-ink" : "text-paper"}`} strokeWidth={3} aria-hidden="true" />}
      {soldOut && <span className="absolute left-1/2 top-1/2 h-px w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] bg-neutral-500" aria-hidden="true" />}
    </Tag>
  );
}

export const isLight = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ""));
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.72;
};
