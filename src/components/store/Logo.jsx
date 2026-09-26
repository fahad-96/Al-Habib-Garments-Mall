import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ className = "", inverse = false, compact = false }) {
  return (
    <Link to="/" className={`inline-flex flex-col items-center leading-none ${inverse ? "text-paper" : "text-ink"} ${className}`} aria-label="Al Habib Garments Mall, home">
      <span className={`font-display ${compact ? "text-xl" : "text-2xl sm:text-[26px]"} tracking-[0.04em]`}>AL HABIB</span>
      <span className={`mt-1 ${compact ? "text-[8px]" : "text-[9px]"} font-medium uppercase tracking-[0.32em] ${inverse ? "text-neutral-400" : "text-neutral-500"}`}>Garments Mall</span>
    </Link>
  );
}
