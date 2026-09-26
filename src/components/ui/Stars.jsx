import React from "react";
import { Star } from "lucide-react";

export default function Stars({ value = 0, count, size = "sm", className = "", interactive = false, onChange, dark = false }) {
  const px = size === "lg" ? "h-6 w-6" : size === "md" ? "h-4 w-4" : "h-3 w-3";
  const rounded = Math.round(Number(value) * 2) / 2;
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} aria-label={`${value} out of 5`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
          const star = (
            <span key={i} className={`relative inline-block ${px}`}>
              <Star className={`absolute inset-0 ${px} ${dark ? "text-neutral-600" : "text-neutral-300"}`} strokeWidth={1.5} aria-hidden="true" />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className={`${px} ${dark ? "fill-paper text-paper" : "fill-ink text-ink"}`} strokeWidth={1.5} aria-hidden="true" />
                </span>
              )}
            </span>
          );
          return interactive ? (
            <button key={i} type="button" onClick={() => onChange?.(i)} className="p-0.5 hover:scale-110 transition-transform" aria-label={`${i} star${i > 1 ? "s" : ""}`}>
              {star}
            </button>
          ) : (
            star
          );
        })}
      </div>
      {count != null && <span className={`text-xs ${dark ? "text-neutral-400" : "text-neutral-500"}`}>({count})</span>}
    </div>
  );
}
