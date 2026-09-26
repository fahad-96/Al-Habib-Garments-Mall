import React from "react";
import { Link } from "react-router-dom";

// Brand lockup: monogram mark + wordmark. `inverse` for dark surfaces, `compact` for tight spots.
export default function Logo({ className = "", inverse = false, compact = false, to = "/" }) {
  const markCls = inverse ? "bg-paper text-ink" : "bg-ink text-paper";
  const subCls = inverse ? "text-neutral-400" : "text-neutral-500";
  return (
    <Link to={to} className={`group inline-flex items-center gap-2.5 leading-none sm:gap-3 ${inverse ? "text-paper" : "text-ink"} ${className}`} aria-label="Al Habib Garments Mall, home">
      <span className={`flex shrink-0 items-center justify-center font-display font-medium leading-none tracking-[0.02em] ${markCls} ${compact ? "h-8 w-8 text-[15px]" : "h-10 w-10 text-[19px] sm:h-11 sm:w-11 sm:text-[21px] lg:h-12 lg:w-12 lg:text-[23px]"}`} aria-hidden="true">
        AH
      </span>
      <span className="flex flex-col">
        <span className={`font-display font-medium tracking-[0.08em] ${compact ? "text-lg" : "text-[21px] sm:text-[24px] lg:text-[27px]"}`}>AL HABIB</span>
        <span className={`mt-1 font-semibold uppercase ${compact ? "text-[7px] tracking-[0.3em]" : "text-[8px] tracking-[0.34em] sm:text-[9px] lg:text-[10px]"} ${subCls}`}>Garments Mall</span>
      </span>
    </Link>
  );
}
