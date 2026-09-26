import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { pluralize } from "../../../lib/format";
import { textButton } from "./ConfigCard";
import { appliesSummary } from "./sizeGuideUtils";

const PREVIEW_ROWS = 4;

// A few rows of the chart so the admin can tell guides apart at a glance.
function MiniTable({ guide }) {
  const columns = guide.columns || [];
  const rows = (guide.rows || []).slice(0, PREVIEW_ROWS);
  const more = (guide.rows || []).length - rows.length;
  if (!columns.length) return <p className="text-xs text-neutral-500">No columns yet.</p>;
  return (
    <div className="overflow-hidden border border-neutral-800">
      <table className="w-full table-fixed text-xs">
        <thead>
          <tr className="bg-neutral-900/70">
            {columns.map((c, i) => (
              <th key={i} scope="col" className={`whitespace-normal px-2.5 py-1.5 text-left align-bottom text-xs font-normal leading-4 text-neutral-500 ${i === 0 ? "" : "text-right"}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-t border-neutral-800">
              {columns.map((_, ci) => (
                <td key={ci} className={`truncate px-2.5 py-1.5 tabular-nums ${ci === 0 ? "font-medium text-paper" : "text-right text-neutral-300"}`}>
                  {r[ci] || ""}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr className="border-t border-neutral-800">
              <td colSpan={columns.length} className="px-2.5 py-3 text-center text-neutral-500">
                No rows yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {more > 0 && <p className="border-t border-neutral-800 px-2.5 py-1.5 text-2xs uppercase tracking-micro text-neutral-500">+{pluralize(more, "more size")}</p>}
    </div>
  );
}

export default function SizeGuideList({ guides, onEdit, onDelete, className = "" }) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {guides.map((g) => {
        const { departments, sizeSets } = appliesSummary(g);
        return (
          <li key={g.id} className="admin-card flex min-w-0 flex-col">
            <header className="border-b border-neutral-800 px-5 py-4">
              <h2 className="font-display text-xl leading-tight text-paper">{g.title || "Untitled guide"}</h2>
              <p className="mt-1.5 truncate text-xs text-neutral-500">
                {departments.length ? departments.join(", ") : "Any department"} · {sizeSets.length ? sizeSets.join(", ") : "No size set"}
              </p>
            </header>
            <div className="flex-1 px-5 py-4">
              <MiniTable guide={g} />
              {g.note && <p className="mt-3 line-clamp-2 text-xs leading-5 text-neutral-500">{g.note}</p>}
            </div>
            <footer className="flex items-center justify-between gap-3 border-t border-neutral-800 px-5 py-2">
              <div className="flex items-center gap-5">
                <button type="button" onClick={() => onEdit(g)} className={textButton}>
                  Edit
                </button>
                <button type="button" onClick={() => onDelete(g)} className={textButton}>
                  Delete
                </button>
              </div>
              {g.slug && (
                <Link to={`/size-guide?guide=${encodeURIComponent(g.slug)}`} target="_blank" rel="noreferrer" className={`${textButton} gap-1`}>
                  View
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              )}
            </footer>
          </li>
        );
      })}
    </ul>
  );
}
