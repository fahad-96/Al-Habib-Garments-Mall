import React from "react";
import { X } from "lucide-react";
import Button from "../../ui/Button";

// Appears above the table while rows are selected.
export default function BulkBar({ count, busy, onActivate, onHide, onDelete, onClear }) {
  if (!count) return null;
  return (
    <div className="sticky top-16 z-20 mb-3 flex flex-wrap items-center gap-2 border border-neutral-700 bg-neutral-900 py-2 pl-4 pr-2 lg:top-4" role="region" aria-label="Bulk actions">
      <p className="basis-full text-sm text-paper sm:mr-auto sm:basis-auto">
        <span className="font-medium tabular-nums">{count}</span> selected
      </p>
      <Button variant="inverse-outline" size="sm" onClick={onActivate} loading={busy === "activate"} disabled={Boolean(busy)}>
        Activate
      </Button>
      <Button variant="inverse-outline" size="sm" onClick={onHide} loading={busy === "hide"} disabled={Boolean(busy)}>
        Hide
      </Button>
      <Button variant="inverse-outline" size="sm" onClick={onDelete} disabled={Boolean(busy)}>
        Delete
      </Button>
      <button type="button" onClick={onClear} className="flex h-10 w-10 items-center justify-center text-neutral-400 transition-colors hover:text-paper" aria-label="Clear selection">
        <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
