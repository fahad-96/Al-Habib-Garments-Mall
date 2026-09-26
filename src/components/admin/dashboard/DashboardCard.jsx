import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Dark card with a hairline header. `to` adds a small "view all" style link.
export default function DashboardCard({ title, meta, to, linkLabel = "View all", children, className = "" }) {
  return (
    <section className={`admin-card flex flex-col ${className}`}>
      <header className="flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <h2 className="font-display text-xl leading-none text-paper">{title}</h2>
          {meta && <span className="truncate text-xs text-neutral-500">{meta}</span>}
        </div>
        {to && (
          <Link to={to} className="group inline-flex shrink-0 items-center gap-1.5 text-2xs font-medium uppercase tracking-micro text-neutral-400 transition-colors hover:text-paper">
            {linkLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

export function CardEmpty({ children }) {
  return <p className="px-5 py-10 text-center text-sm text-neutral-500">{children}</p>;
}
