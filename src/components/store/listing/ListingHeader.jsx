import React from "react";
import Breadcrumbs from "../../ui/Breadcrumbs";
import Reveal from "../../ui/Reveal";

// Breadcrumbs, eyebrow, display H1, count and an optional line of copy.
export default function ListingHeader({ crumbs = [], eyebrow, title, description, count, ready = true, className = "" }) {
  const countText = ready && count ? `${count} ${count === 1 ? "item" : "items"}` : "";
  return (
    <header className={className}>
      {crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
      <Reveal className={crumbs.length ? "mt-5 sm:mt-7" : ""}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">{title}</h1>
          {countText && <span className="text-sm tabular-nums text-neutral-500 lg:hidden">{countText}</span>}
        </div>
        {description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">{description}</p>}
      </Reveal>
    </header>
  );
}
