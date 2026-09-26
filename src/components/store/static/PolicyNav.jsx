import React from "react";

// Anchor navigation for the policies page: a sticky column on desktop, a scrolling row of links on mobile.
export default function PolicyNav({ sections = [], activeId = "", onSelect, className = "" }) {
  return (
    <nav aria-label="Policy sections" className={className}>
      <ul className="no-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
        {sections.map((s) => {
          const active = s.id === activeId;
          return (
            <li key={s.id} className="shrink-0 lg:shrink">
              <a
                href={`#${s.id}`}
                onClick={(e) => onSelect?.(e, s.id)}
                aria-current={active ? "location" : undefined}
                className={`flex min-h-11 items-center gap-3 whitespace-nowrap border-b-2 px-0.5 text-2xs font-medium uppercase tracking-micro transition-colors lg:border-b-0 lg:border-l lg:px-4 lg:py-2.5 ${active ? "border-ink text-ink" : "border-transparent text-neutral-500 hover:text-ink lg:border-line"}`}
              >
                <span className="hidden font-display text-sm normal-case tracking-normal text-neutral-400 lg:inline" aria-hidden="true">
                  {s.number}
                </span>
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
