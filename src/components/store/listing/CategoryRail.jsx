import React from "react";
import { Link } from "react-router-dom";

// Horizontal chip rail of a department's categories. Scrolls on small screens, wraps on large.
export default function CategoryRail({ department, categories = [], current = null, className = "" }) {
  if (!department || !categories.length) return null;
  return (
    <nav className={`-mx-4 sm:-mx-6 lg:mx-0 ${className}`} aria-label={`${department.name} categories`}>
      <ul className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-6 lg:flex-wrap lg:px-0">
        <li className="shrink-0">
          <Link to={`/shop/${department.key}`} className={`chip ${current ? "" : "chip-active"}`} aria-current={current ? undefined : "page"}>
            All
          </Link>
        </li>
        {categories.map((c) => {
          const on = c.key === current;
          return (
            <li key={c.key} className="shrink-0">
              <Link to={`/shop/${c.department}/${c.slug}`} className={`chip whitespace-nowrap ${on ? "chip-active" : ""}`} aria-current={on ? "page" : undefined}>
                {c.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
