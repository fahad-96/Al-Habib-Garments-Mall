import React from "react";
import { Link } from "react-router-dom";
import BrandMark from "./BrandMark";

// Brand lockup: shield-and-hanger emblem, blackletter "Al Habib" with a slow silver sheen,
// and a tracked "GARMENTS MALL". `inverse` for dark surfaces, `compact` for tight spots.
export default function Logo({ className = "", inverse = false, compact = false, to = "/", mark = true }) {
  const subCls = inverse ? "text-neutral-400" : "text-neutral-500";
  return (
    <Link to={to} className={`inline-flex items-center gap-3 leading-none sm:gap-3.5 ${inverse ? "text-paper" : "text-ink"} ${className}`} aria-label="Al Habib Garments Mall, home">
      {mark && <BrandMark className={compact ? "h-8 w-8" : "h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16"} />}
      <span className="flex flex-col">
        <span className={`wordmark-shine font-brand font-bold tracking-[0.01em] ${inverse ? "wordmark-shine-inverse" : ""} ${compact ? "text-[26px]" : "text-[30px] sm:text-[36px] lg:text-[50px]"}`}>Al Habib</span>
        <span className={`font-semibold uppercase ${compact ? "mt-0.5 text-[8px] tracking-[0.3em]" : "mt-1 text-[9px] tracking-[0.36em] sm:text-[10px] lg:text-[11px]"} ${subCls}`}>Garments Mall</span>
      </span>
    </Link>
  );
}
