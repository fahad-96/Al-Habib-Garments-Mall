import React from "react";
import { Minus, Plus } from "lucide-react";

export default function QtyStepper({ value, onChange, min = 1, max = 10, size = "md", className = "" }) {
  const h = size === "sm" ? "h-8" : "h-11";
  const w = size === "sm" ? "w-8" : "w-11";
  const dec = () => onChange?.(Math.max(min, value - 1));
  const inc = () => onChange?.(Math.min(max, value + 1));
  return (
    <div className={`inline-flex items-center border border-neutral-300 ${h} ${className}`} role="group" aria-label="Quantity">
      <button type="button" onClick={dec} disabled={value <= min} className={`flex ${w} h-full items-center justify-center hover:bg-neutral-100 disabled:opacity-30`} aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={`flex ${w} h-full items-center justify-center border-x border-neutral-300 text-sm tabular-nums`} aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={inc} disabled={value >= max} className={`flex ${w} h-full items-center justify-center hover:bg-neutral-100 disabled:opacity-30`} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
