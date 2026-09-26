import React from "react";

// Monochrome status pill for the dark admin. `tone`: solid | outline | muted.
const ORDER_TONES = { new: "solid", confirmed: "outline", packed: "outline", shipped: "outline", delivered: "muted", cancelled: "muted" };

export default function StatusPill({ children, tone = "outline", status, className = "" }) {
  const t = status ? ORDER_TONES[status] || "outline" : tone;
  const cls = {
    solid: "bg-paper text-ink",
    outline: "border border-neutral-500 text-neutral-100",
    muted: "border border-neutral-800 text-neutral-500",
  }[t];
  return <span className={`inline-flex items-center px-2 py-0.5 text-2xs font-medium uppercase tracking-micro leading-relaxed ${cls} ${className}`}>{children || status}</span>;
}
