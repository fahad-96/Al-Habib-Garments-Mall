import React from "react";

// Monochrome badges. `tone`: "dark" (black bg), "light" (white bg with border), "muted".
export default function Badge({ children, tone = "dark", className = "" }) {
  const tones = {
    dark: "bg-ink text-paper",
    light: "bg-paper text-ink border border-ink",
    muted: "bg-neutral-100 text-neutral-700",
    outline: "border border-neutral-300 text-neutral-700",
  };
  return <span className={`inline-flex items-center px-2 py-1 text-2xs font-medium uppercase tracking-micro leading-none ${tones[tone] || tones.dark} ${className}`}>{children}</span>;
}
