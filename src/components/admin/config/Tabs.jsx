import React from "react";

// Underlined tab strip with optional counts. Scrolls sideways on phones; the parent draws the baseline.
export default function Tabs({ tabs, value, counts = {}, onChange, label = "Filter", className = "" }) {
  return (
    <div className={`no-scrollbar -mb-px flex overflow-x-auto ${className}`} role="tablist" aria-label={label}>
      {tabs.map((t) => {
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
