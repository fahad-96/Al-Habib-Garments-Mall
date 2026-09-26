import React from "react";
import { formatINR, discountPercent } from "../../lib/format";

export default function Price({ price, mrp, size = "md", className = "", showDiscount = true, align = "left" }) {
  const off = discountPercent(mrp, price);
  const sizes = {
    sm: { price: "text-sm", mrp: "text-xs", off: "text-2xs" },
    md: { price: "text-base", mrp: "text-sm", off: "text-xs" },
    lg: { price: "text-2xl", mrp: "text-base", off: "text-sm" },
  }[size] || {};
  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${align === "center" ? "justify-center" : ""} ${className}`}>
      <span className={`font-semibold tabular-nums ${sizes.price}`}>{formatINR(price)}</span>
      {off > 0 && (
        <>
          <span className={`tabular-nums text-neutral-500 line-through ${sizes.mrp}`}>
            <span className="sr-only">Was </span>
            {formatINR(mrp)}
          </span>
          {showDiscount && <span className={`font-medium uppercase tracking-micro text-neutral-600 ${sizes.off}`}>{off}% off</span>}
        </>
      )}
    </div>
  );
}
