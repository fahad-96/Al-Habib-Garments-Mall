import React, { useEffect, useState } from "react";
import Drawer from "../../ui/Drawer";
import Button from "../../ui/Button";
import { EMPTY_FILTERS, activeFilterCount } from "../../../lib/catalogUtils";
import { FilterPanel } from "./FilterGroups";

// Mobile: edits a draft, commits on Apply.
export default function FilterDrawer({ open, onClose, mode, filters, facets, countFor, onApply, department, category, siblingCategories }) {
  const [draft, setDraft] = useState(filters);
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const draftCount = activeFilterCount(draft);
  const results = countFor(draft);
  const apply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="bottom"
      title={draftCount > 0 ? `Filter · ${draftCount}` : "Filter"}
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-3 px-5 py-4">
          <Button variant="secondary" onClick={() => setDraft(EMPTY_FILTERS)} disabled={draftCount === 0}>
            Clear
          </Button>
          <Button onClick={apply} full disabled={results === 0}>
            {results === 0 ? "No matches" : `Show ${results} ${results === 1 ? "item" : "items"}`}
          </Button>
        </div>
      }
    >
      <div className="px-5">
        <FilterPanel mode={mode} filters={draft} facets={facets} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} department={department} category={category} siblingCategories={siblingCategories} />
      </div>
    </Drawer>
  );
}
