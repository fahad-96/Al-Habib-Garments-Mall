import React from "react";
import { Plus, X } from "lucide-react";
import { textButton } from "./ConfigCard";

const MAX_COLUMNS = 8;

// Names of the chart's columns. The first one is the size itself; the rest are measurements.
export default function ColumnsEditor({ columns, onChange, error }) {
  const rename = (i, name) => onChange(columns.map((c, ci) => (ci === i ? name : c)), null);
  const remove = (i) => onChange(columns.filter((_, ci) => ci !== i), { removeIndex: i });
  const add = () => onChange([...columns, ""], { addIndex: columns.length });

  return (
    <div>
      <ul className="flex flex-wrap gap-2" aria-label="Columns">
        {columns.map((name, i) => (
          <li key={i} className="flex items-center border border-neutral-700 bg-neutral-900 focus-within:border-paper">
            <input
              type="text"
              value={name}
              onChange={(e) => rename(i, e.target.value)}
              placeholder={i === 0 ? "Size" : "Chest (in)"}
              aria-label={`Column ${i + 1} name`}
              className="h-10 w-32 bg-transparent px-3 text-sm text-paper placeholder:text-neutral-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={columns.length <= 1}
              className="flex h-10 w-9 items-center justify-center text-neutral-500 transition-colors hover:text-paper disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={`Remove column ${name || i + 1}`}
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </li>
        ))}
        {columns.length < MAX_COLUMNS && (
          <li>
            <button type="button" onClick={add} className={`${textButton} h-10 gap-1.5 border border-dashed border-neutral-700 px-3 hover:border-neutral-400`}>
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Add column
            </button>
          </li>
        )}
      </ul>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : <p className="mt-2 text-xs text-neutral-500">Put the unit in the name, for example Chest (in) or Height (cm).</p>}
    </div>
  );
}
