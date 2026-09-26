import React, { useId } from "react";
import { Plus } from "lucide-react";
import { SIZE_SETS } from "../../../data/catalog";
import { pluralize } from "../../../lib/format";
import Button from "../../ui/Button";
import { ArtThumb, LivePill, RowActions } from "./bits";

// Shared column template so the header and the rows line up on desktop.
const GRID = "lg:grid lg:grid-cols-[2.5rem_minmax(0,1fr)_9rem_5.5rem_4rem_5rem_5rem] lg:items-center lg:gap-x-5";

function CategoryRow({ category: c, count, onEdit, onDelete }) {
  const sizeLabel = SIZE_SETS[c.sizeSet]?.label || c.sizeSet || "—";
  const shortSize = sizeLabel.replace(/\s*\(.*\)$/, "");
  return (
    <li className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-900/50 sm:px-5 ${GRID}`}>
      <ArtThumb src={c.imageUrl} label={c.name?.slice(0, 1)} dim={!c.isActive} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${c.isActive ? "text-paper" : "text-neutral-400"}`}>{c.name}</p>
        <p className="mt-0.5 truncate font-mono text-xs text-neutral-500">{c.slug}</p>
        <p className="mt-1 text-xs leading-5 text-neutral-400 lg:hidden">
          {shortSize} · {pluralize(count, "product")} · Sort {c.sortOrder}
          {!c.isActive && " · Hidden"}
        </p>
      </div>
      <p className="hidden truncate text-sm text-neutral-300 lg:block">{sizeLabel}</p>
      <p className={`hidden text-sm tabular-nums lg:block ${count ? "text-paper" : "text-neutral-500"}`}>{count}</p>
      <p className="hidden text-sm tabular-nums text-neutral-400 lg:block">{c.sortOrder}</p>
      <div className="hidden lg:block">
        <LivePill active={c.isActive} />
      </div>
      <RowActions name={c.name} onEdit={onEdit} onDelete={onDelete} className="-mr-2 lg:justify-end" />
    </li>
  );
}

export default function CategoryGroup({ department, rows, countFor, onAdd, onEdit, onDelete }) {
  const headingId = useId();
  const total = rows.reduce((sum, c) => sum + countFor(c.key), 0);
  return (
    <section className="admin-card" aria-labelledby={headingId}>
      <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 id={headingId} className="font-display text-xl leading-none text-paper">
            {department.name}
          </h2>
          <p className="mt-2 text-xs text-neutral-500">
            {rows.length ? `${pluralize(rows.length, "category", "categories")} · ${pluralize(total, "product")} on the store` : "No categories yet"}
          </p>
        </div>
        <Button variant="inverse-outline" size="sm" onClick={onAdd} aria-label={`Add a ${department.name} category`}>
          <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          Add
        </Button>
      </header>

      {rows.length ? (
        <>
          <div className={`hidden border-t border-neutral-800 px-5 py-2.5 text-2xs font-medium uppercase tracking-micro text-neutral-500 ${GRID}`} aria-hidden="true">
            <span />
            <span>Category</span>
            <span>Size set</span>
            <span>Products</span>
            <span>Sort</span>
            <span>Status</span>
            <span />
          </div>
          <ul className="divide-y divide-neutral-800 border-t border-neutral-800">
            {rows.map((c) => (
              <CategoryRow key={c.key} category={c} count={countFor(c.key)} onEdit={() => onEdit(c)} onDelete={() => onDelete(c)} />
            ))}
          </ul>
        </>
      ) : (
        <p className="border-t border-neutral-800 px-4 py-6 text-sm text-neutral-500 sm:px-5">{department.name} appears in the store navigation once it has a category with products.</p>
      )}
    </section>
  );
}
