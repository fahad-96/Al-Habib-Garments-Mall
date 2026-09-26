import React from "react";
import { ORDER_STATUSES } from "../../../data/catalog";

export const TABS = [{ key: "all", label: "All" }, ...ORDER_STATUSES.map(({ key, label }) => ({ key, label }))];
export const isTabKey = (key) => TABS.some((t) => t.key === key);

// Underlined filter strip. Scrolls sideways on phones; the parent draws the baseline.
export default function StatusTabs({ value, counts = {}, onChange, className = "" }) {
  return (
    <div className={`no-scrollbar -mb-px flex overflow-x-auto ${className}`} role="tablist" aria-label="Filter orders by status">
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm transition-colors first:pl-0 sm:px-4 ${active ? "border-paper text-paper" : "border-transparent text-neutral-500 hover:text-neutral-200"}`}
          >
            {t.label}
            {counts[t.key] != null && <span className={`text-xs tabular-nums ${active ? "text-neutral-400" : "text-neutral-600"}`}>{counts[t.key]}</span>}
          </button>
        );
      })}
    </div>
  );
}
