import React from "react";
import { X } from "lucide-react";
import { priceLabel } from "./FilterGroups";

// Chips for every active filter, each individually removable.
export default function ActiveFilters({ filters, categories = [], onChange, onClear, className = "" }) {
  const chips = [];
  const without = (list, v) => list.filter((x) => x !== v);
  (filters.categories || []).forEach((key) => {
    const c = categories.find((x) => x.key === key);
    chips.push({ key: `cat-${key}`, label: c ? c.name : key, remove: () => onChange({ categories: without(filters.categories, key) }) });
  });
  (filters.sizes || []).forEach((s) => chips.push({ key: `size-${s}`, label: `Size ${s}`, remove: () => onChange({ sizes: without(filters.sizes, s) }) }));
  (filters.colors || []).forEach((c) => chips.push({ key: `color-${c}`, label: c, remove: () => onChange({ colors: without(filters.colors, c) }) }));
  if (filters.min != null || filters.max != null) chips.push({ key: "price", label: priceLabel(filters.min, filters.max), remove: () => onChange({ min: null, max: null }) });
  if (filters.discount) chips.push({ key: "discount", label: `${filters.discount}% off and above`, remove: () => onChange({ discount: 0 }) });
  if (filters.inStock) chips.push({ key: "instock", label: "In stock", remove: () => onChange({ inStock: false }) });
  (filters.badges || []).forEach((b) => chips.push({ key: `badge-${b}`, label: b, remove: () => onChange({ badges: without(filters.badges, b) }) }));

  if (!chips.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} role="group" aria-label="Active filters">
      {chips.map((chip) => (
        <button key={chip.key} type="button" onClick={chip.remove} className="group inline-flex min-h-10 max-w-full items-center gap-1.5 border border-ink bg-ink py-1.5 pl-3 pr-2 text-left text-xs font-medium text-paper transition-colors hover:bg-paper hover:text-ink lg:min-h-9" aria-label={`Remove filter ${chip.label}`}>
          <span className="min-w-0 [overflow-wrap:anywhere]">{chip.label}</span>
          <X className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
        </button>
      ))}
      <button type="button" onClick={onClear} className="ml-1 h-10 text-2xs font-medium uppercase tracking-micro text-neutral-500 underline underline-offset-4 hover:text-ink lg:h-9">
        Clear all
      </button>
    </div>
  );
}
