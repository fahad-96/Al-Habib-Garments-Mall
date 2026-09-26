import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "../../ui/Fields";
import { DETAIL_FIELDS } from "../../../data/catalog";
import { DETAIL_PLACEHOLDERS, isStandardDetail } from "./productEditor";
import EditorSection from "./EditorSection";

const customRowsFrom = (details) =>
  Object.entries(details || {})
    .filter(([key]) => !isStandardDetail(key))
    .map(([key, value], i) => ({ id: `row-${i}`, key, value: String(value ?? "") }));

const standardOnly = (details) => Object.fromEntries(Object.entries(details || {}).filter(([key]) => isStandardDetail(key)));

const rowsToObject = (rows) => Object.fromEntries(rows.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value]));

// Standard detail fields plus free key/value rows. Empty values are dropped on save.
export default function DetailsEditor({ details, onChange }) {
  const [rows, setRows] = useState(() => customRowsFrom(details));

  const setStandard = (key, value) => onChange({ ...details, [key]: value });
  const emitRows = (next) => {
    setRows(next);
    onChange({ ...standardOnly(details), ...rowsToObject(next) });
  };
  const updateRow = (id, changes) => emitRows(rows.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  const removeRow = (id) => emitRows(rows.filter((r) => r.id !== id));
  const addRow = () => setRows((rs) => [...rs, { id: `row-${Date.now().toString(36)}-${rs.length}`, key: "", value: "" }]);

  return (
    <EditorSection
      id="details"
      title="Details"
      description="Shown under the description on the product page. Leave anything blank that does not apply."
      aside={
        <button type="button" onClick={addRow} className="btn btn-inverse-outline btn-sm">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Add a detail
        </button>
      }
    >
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        {DETAIL_FIELDS.map(([key, label]) => (
          <Input key={key} dark label={label} value={details?.[key] || ""} onChange={(e) => setStandard(key, e.target.value)} placeholder={DETAIL_PLACEHOLDERS[key] || ""} autoComplete="off" className={key === "highlights" || key === "washCare" ? "sm:col-span-2" : ""} />
        ))}
      </div>

      {rows.length > 0 && (
        <div className="mt-6 border-t border-neutral-800 pt-5">
          <p className="label label-dark">Extra details</p>
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto]">
                <input value={row.key} onChange={(e) => updateRow(row.id, { key: e.target.value })} placeholder="Label, e.g. Embroidery" aria-label="Detail label" autoComplete="off" className="field field-dark min-w-0" />
                <input value={row.value} onChange={(e) => updateRow(row.id, { value: e.target.value })} placeholder="Value" aria-label="Detail value" autoComplete="off" className="field field-dark col-span-2 min-w-0 sm:col-span-1 sm:row-auto" />
                <button type="button" onClick={() => removeRow(row.id)} className="col-start-2 row-start-1 flex h-full min-h-[2.75rem] w-11 items-center justify-center border border-neutral-700 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-paper sm:col-start-auto sm:row-start-auto" aria-label={`Remove ${row.key || "detail"}`}>
                  <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </EditorSection>
  );
}
