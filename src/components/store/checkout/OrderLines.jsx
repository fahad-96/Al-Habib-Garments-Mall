import React from "react";
import { Link } from "react-router-dom";
import { formatINR } from "../../../lib/format";
import Img from "../../ui/Img";

// Compact, read-only list of order lines with thumbnails (order placed, tracking).
export default function OrderLines({ lines = [], className = "" }) {
  if (!lines.length) return null;
  return (
    <ul className={`divide-y divide-line border-y border-line ${className}`}>
      {lines.map((l, i) => {
        const qty = Number(l.qty) || 0;
        const total = (Number(l.price) || 0) * qty;
        const meta = [[l.color, l.size].filter(Boolean).join(" / "), `Qty ${qty}`].filter(Boolean).join(" · ");
        const image = <Img src={l.image} alt={l.title || "Item"} />;
        const frame = "img-frame aspect-[3/4] w-16 shrink-0";
        return (
          <li key={`${l.slug || l.title}-${l.color}-${l.size}-${i}`} className="flex items-center gap-4 py-4">
            {l.slug ? (
              <Link to={`/product/${l.slug}`} className={frame} aria-label={l.title}>
                {image}
              </Link>
            ) : (
              <div className={frame}>{image}</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium leading-snug">{l.title || "Item"}</p>
              <p className="mt-1 text-xs text-neutral-500">{meta}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">{formatINR(total)}</p>
          </li>
        );
      })}
    </ul>
  );
}
