import React from "react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { sortLabel } from "./SortMenu";

// Sticky bar under the header on small screens: opens the filter and sort sheets.
export default function MobileBar({ filterCount = 0, sort, onFilter, onSort, count, ready = true }) {
  return (
    <div className="sticky top-[var(--header-h)] z-30 -mx-4 border-y border-line bg-paper sm:-mx-6 lg:hidden">
      <div className="grid grid-cols-2 divide-x divide-line">
        <button type="button" onClick={onFilter} className="flex h-12 items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-micro">
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Filter
          {filterCount > 0 && <span className="text-neutral-500">({filterCount})</span>}
        </button>
        <button type="button" onClick={onSort} className="flex h-12 items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-micro">
          <ArrowUpDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Sort
          {sort && sort !== "recommended" && <span className="max-w-[9rem] truncate normal-case tracking-normal text-neutral-500">· {sortLabel(sort)}</span>}
        </button>
      </div>
      {ready && count != null && <p className="sr-only" aria-live="polite">{`${count} ${count === 1 ? "item" : "items"}`}</p>}
    </div>
  );
}
