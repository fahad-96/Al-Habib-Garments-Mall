import React from "react";

// Clean measurement table: hairline rows, bold first column, tabular figures.
export default function SizeTable({ columns = [], rows = [], caption = "", className = "" }) {
  if (!columns.length || !rows.length) return null;
  return (
    <div className={`-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 ${className}`}>
      <table className="w-full min-w-[22rem] border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={`${c}-${i}`} scope="col" className={`border-b border-ink py-3 pr-4 text-left text-2xs font-medium uppercase tracking-micro text-ink last:pr-0 ${i === 0 ? "w-[6.5rem] sm:w-32" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row[0]}-${i}`} className="border-b border-line">
              {columns.map((_, j) => (
                <td key={j} className={`py-3 pr-4 tabular-nums last:pr-0 ${j === 0 ? "font-medium text-ink" : "text-neutral-700"}`}>
                  {row[j] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
