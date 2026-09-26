import React from "react";
import { Link } from "react-router-dom";

// Links get a 40px-tall hit area (negative margin keeps the visual row 16px tall).
export default function Breadcrumbs({ items = [], className = "" }) {
  return (
    <nav aria-label="Breadcrumb" className={`text-2xs uppercase tracking-micro text-neutral-500 ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.to && !last ? (
                <Link to={item.to} className="-my-3 inline-flex min-h-10 items-center hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "text-ink" : ""} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
