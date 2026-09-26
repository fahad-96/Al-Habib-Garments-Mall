import React from "react";
import { Link } from "react-router-dom";

// One cell of the hairline stat grid. `hint` is the quiet second line.
export default function StatTile({ label, value, hint, to }) {
  const cls = "block min-w-0 bg-neutral-950 p-4 transition-colors sm:p-5 lg:p-6";
  const inner = (
    <>
      <p className="min-h-[2rem] text-2xs font-medium uppercase leading-4 tracking-micro text-neutral-500 sm:min-h-0">{label}</p>
      <p className="mt-3 truncate font-display text-[28px] leading-none tabular-nums text-paper sm:text-4xl">{value}</p>
      <p className="mt-2 truncate text-xs text-neutral-500">{hint || " "}</p>
    </>
  );
  if (to) {
    return (
      <Link to={to} className={`${cls} hover:bg-neutral-900`}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function StatGrid({ children, className = "" }) {
  return <div className={`grid grid-cols-2 gap-px border border-neutral-800 bg-neutral-800 lg:grid-cols-4 ${className}`}>{children}</div>;
}
