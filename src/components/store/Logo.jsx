import React from "react";
import { Link } from "react-router-dom";

// Brand wordmark: bold Bodoni "AL HABIB" over a tracked "GARMENTS MALL". `inverse` for dark surfaces.
export default function Logo({ className = "", inverse = false, compact = false, to = "/" }) {
  const subCls = inverse ? "text-neutral-400" : "text-neutral-500";
  return (
    <Link to={to} className={`inline-flex flex-col leading-none ${inverse ? "text-paper" : "text-ink"} ${className}`} aria-label="Al Habib Garments Mall, home">
      <span className={`font-display font-bold tracking-[0.06em] ${compact ? "text-2xl" : "text-[28px] sm:text-[34px] lg:text-[42px]"}`}>AL HABIB</span>
      <span className={`mt-1 font-semibold uppercase ${compact ? "text-[8px] tracking-[0.3em]" : "text-[9px] tracking-[0.36em] sm:text-[10px] lg:mt-1.5 lg:text-[11px]"} ${subCls}`}>Garments Mall</span>
    </Link>
  );
}
