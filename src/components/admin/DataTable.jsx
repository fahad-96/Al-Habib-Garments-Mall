import React from "react";
import Spinner from "../ui/Spinner";

// columns: [{ key, label, render?(row), className?, hideBelow?: "sm"|"md"|"lg" }]
export default function DataTable({ columns, rows, rowKey = "id", loading = false, error = "", empty = "Nothing here yet.", onRowClick, selectable = false, selected = new Set(), onToggle, onToggleAll }) {
  const hide = (bp) => (bp ? { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell" }[bp] : "");
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r[rowKey]));
  return (
    <div className="admin-card overflow-x-auto">
      <table className="admin-table w-full min-w-[560px]">
        <thead>
          <tr>
            {selectable && (
              <th className="w-10">
                <input type="checkbox" checked={allSelected} onChange={(e) => onToggleAll?.(e.target.checked)} aria-label="Select all" className="h-4 w-4 accent-white" />
              </th>
            )}
            {columns.map((c) => (
              <th key={c.key} className={`${c.className || ""} ${hide(c.hideBelow)}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)}>
                <Spinner />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-10 text-center text-sm text-red-400">
                {error}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center text-sm text-neutral-500">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]} onClick={onRowClick ? () => onRowClick(row) : undefined} className={`${onRowClick ? "cursor-pointer hover:bg-neutral-900" : ""} ${selected.has(row[rowKey]) ? "bg-neutral-900/60" : ""}`}>
                {selectable && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(row[rowKey])} onChange={() => onToggle?.(row[rowKey])} aria-label="Select row" className="h-4 w-4 accent-white" />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} className={`${c.className || ""} ${hide(c.hideBelow)}`}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
