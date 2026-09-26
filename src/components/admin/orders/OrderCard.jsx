import React from "react";

// Dark section card with a hairline header. `aside` sits at the right of the title.
export default function OrderCard({ title, aside, children, className = "", flush = false }) {
  return (
    <section className={`admin-card ${className}`}>
      <header className="flex min-h-[3.5rem] items-center justify-between gap-4 border-b border-neutral-800 px-5 py-3">
        <h2 className="font-display text-xl leading-none text-paper">{title}</h2>
        {aside && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{aside}</div>}
      </header>
      <div className={flush ? "" : "px-5 py-5"}>{children}</div>
    </section>
  );
}
