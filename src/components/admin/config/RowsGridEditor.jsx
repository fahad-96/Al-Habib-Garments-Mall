import React from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { textButton } from "./ConfigCard";
import { padRow } from "./sizeGuideUtils";

const iconBtn = "flex h-9 w-9 items-center justify-center text-neutral-500 transition-colors hover:text-paper disabled:cursor-not-allowed disabled:opacity-30";

// The chart itself: one input per cell. Rows can be added, removed and reordered.
export default function RowsGridEditor({ columns, rows, onChange, error, fillSizes = [], fillLabel = "" }) {
  const n = columns.length;
  const setCell = (ri, ci, value) => onChange(rows.map((r, i) => (i === ri ? r.map((cell, j) => (j === ci ? value : cell)) : r)));
  const remove = (ri) => onChange(rows.filter((_, i) => i !== ri));
  const move = (ri, dir) => {
    const to = ri + dir;
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    [next[ri], next[to]] = [next[to], next[ri]];
    onChange(next);
  };
  const add = () => onChange([...rows, padRow([], n)]);
  const fill = () => onChange([...rows, ...fillSizes.map((s) => padRow([s], n))]);

  return (
    <div>
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[28rem] border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} scope="col" className="pb-1.5 pr-2 text-left text-2xs font-medium uppercase tracking-micro text-neutral-500">
                  {c || `Column ${i + 1}`}
                </th>
              ))}
              <th scope="col" className="w-[6.75rem]">
                <span className="sr-only">Row actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {columns.map((c, ci) => (
                  <td key={ci} className="pb-2 pr-2 align-middle">
                    <input
                      type="text"
                      value={r[ci] ?? ""}
                      onChange={(e) => setCell(ri, ci, e.target.value)}
                      aria-label={`Row ${ri + 1}, ${c || `column ${ci + 1}`}`}
                      className={`field field-dark field-sm h-10 min-w-[5rem] tabular-nums ${ci === 0 ? "font-medium" : ""}`}
                    />
                  </td>
                ))}
                <td className="pb-2 align-middle">
                  <div className="flex items-center justify-end">
                    <button type="button" onClick={() => move(ri, -1)} disabled={ri === 0} className={iconBtn} aria-label={`Move row ${ri + 1} up`}>
                      <ChevronUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => move(ri, 1)} disabled={ri === rows.length - 1} className={iconBtn} aria-label={`Move row ${ri + 1} down`}>
                      <ChevronDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => remove(ri)} className={iconBtn} aria-label={`Remove row ${ri + 1}`}>
                      <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={n + 1} className="border border-dashed border-neutral-800 px-4 py-6 text-center text-sm text-neutral-500">
                  No rows yet. Add one, or fill the first column from a size set.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1">
        <button type="button" onClick={add} className={`${textButton} gap-1.5`}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Add row
        </button>
        {fillSizes.length > 0 && (
          <button type="button" onClick={fill} className={textButton}>
            Add {fillSizes.length} {fillSizes.length === 1 ? "size" : "sizes"} from {fillLabel}
          </button>
        )}
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : <p className="mt-2 text-xs text-neutral-500">Ranges are fine, for example 80-92.</p>}
    </div>
  );
}
