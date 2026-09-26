import React, { useRef } from "react";
import { Star } from "lucide-react";

const ratingText = (value) => {
  const n = Number(value) || 0;
  return n > 0 ? `Rated ${Number(n.toFixed(1))} out of 5` : "Not yet rated";
};

function StarGlyph({ fill, px, dark }) {
  return (
    <span className={`relative inline-block ${px}`} aria-hidden="true">
      <Star className={`absolute inset-0 ${px} ${dark ? "text-neutral-600" : "text-neutral-300"}`} strokeWidth={1.5} />
      {fill > 0 && (
        <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
          <Star className={`${px} ${dark ? "fill-paper text-paper" : "fill-ink text-ink"}`} strokeWidth={1.5} />
        </span>
      )}
    </span>
  );
}

// Static stars are one image named "Rated 4.5 out of 5" (plus the review count when shown).
// Interactive stars are a radio group: Tab lands on the chosen star, arrow keys change the rating.
// Name the group with `label` or `labelledBy`, and point `describedBy` at any error message.
export default function Stars({ value = 0, count, size = "sm", className = "", interactive = false, onChange, dark = false, label, labelledBy, describedBy }) {
  const px = size === "lg" ? "h-6 w-6" : size === "md" ? "h-4 w-4" : "h-3 w-3";
  const rounded = Math.round(Number(value) * 2) / 2;
  const fillFor = (i) => (rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0);
  const refs = useRef([]);

  if (interactive) {
    const current = Math.min(5, Math.max(0, Math.round(Number(value) || 0)));
    const choose = (i) => {
      onChange?.(i);
      refs.current[i - 1]?.focus();
    };
    const onKeyDown = (e) => {
      const at = refs.current.indexOf(document.activeElement) + 1 || current || 1;
      const next = { ArrowRight: at + 1, ArrowUp: at + 1, ArrowLeft: at - 1, ArrowDown: at - 1, Home: 1, End: 5 }[e.key];
      if (next == null) return;
      e.preventDefault();
      choose(Math.min(5, Math.max(1, next)));
    };
    // p-2 gives each star a 40px target on phones; -mx-2 keeps the first star aligned with its label.
    return (
      <div
        role="radiogroup"
        aria-label={labelledBy ? undefined : label || "Rating"}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onKeyDown={onKeyDown}
        className={`-mx-2 inline-flex items-center ${className}`}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            ref={(el) => {
              refs.current[i - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={current === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            tabIndex={i === (current || 1) ? 0 : -1}
            onClick={() => choose(i)}
            className="p-2 transition-transform hover:scale-110"
          >
            <StarGlyph fill={current >= i ? 1 : 0} px={px} dark={dark} />
          </button>
        ))}
      </div>
    );
  }

  const name = count != null ? `${ratingText(value)}, ${count} ${Number(count) === 1 ? "review" : "reviews"}` : ratingText(value);
  return (
    <div role="img" aria-label={name} className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarGlyph key={i} fill={fillFor(i)} px={px} dark={dark} />
        ))}
      </span>
      {count != null && <span className={`text-xs ${dark ? "text-neutral-400" : "text-neutral-500"}`}>({count})</span>}
    </div>
  );
}
