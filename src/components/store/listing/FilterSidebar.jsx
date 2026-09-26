import React from "react";
import { FilterPanel } from "./FilterGroups";

// Desktop: sticky left column. Changes write straight to the URL.
export default function FilterSidebar({ mode, filters, facets, filterCount, onChange, onClear, department, category, siblingCategories }) {
  return (
    <aside className="hidden lg:block" aria-label="Filters">
      <div className="sticky top-[calc(var(--header-h)+1.5rem)] -ml-1 max-h-[calc(100vh-var(--header-h)-3rem)] overflow-y-auto pl-1 pr-3">
        <div className="flex items-baseline justify-between border-b border-ink pb-3">
          <h2 className="text-[13px] font-medium uppercase tracking-micro">
            Filter
            {filterCount > 0 && <span className="ml-2 tabular-nums text-neutral-500">{filterCount}</span>}
          </h2>
          {filterCount > 0 && (
            <button type="button" onClick={onClear} className="text-2xs font-medium uppercase tracking-micro text-neutral-500 underline underline-offset-4 hover:text-ink">
              Clear all
            </button>
          )}
        </div>
        <FilterPanel mode={mode} filters={filters} facets={facets} onChange={onChange} department={department} category={category} siblingCategories={siblingCategories} />
      </div>
    </aside>
  );
}
