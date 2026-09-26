import React from "react";
import Reveal from "../../ui/Reveal";

// Scrolled to from the section nav: the margin clears the sticky header plus, below lg, the sticky row of section links.
export default function PolicySection({ id, number, title, summary, children, className = "" }) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={`scroll-mt-[calc(var(--header-h)+4rem)] border-t border-line pt-8 sm:pt-10 lg:scroll-mt-[calc(var(--header-h)+2rem)] ${className}`}>
      <Reveal y={10}>
        <div className="flex items-baseline gap-4">
          <span className="font-display text-lg text-neutral-400 sm:text-xl" aria-hidden="true">
            {number}
          </span>
          <h2 id={headingId} className="font-display text-3xl leading-[1.05] tracking-tight sm:text-4xl/[1.05]">
            {title}
          </h2>
        </div>
        {summary && <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">{summary}</p>}
        <div className="prose-store mt-6 max-w-2xl">{children}</div>
      </Reveal>
    </section>
  );
}
