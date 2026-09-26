import React from "react";

// Dark form card with a hairline header. The id becomes section-<id> so the
// editor can scroll to the first section that has a validation problem.
export default function EditorSection({ id, title, description, aside, children, className = "" }) {
  const headingId = `section-${id}-title`;
  return (
    <section id={`section-${id}`} aria-labelledby={headingId} className={`admin-card scroll-mt-20 lg:scroll-mt-8 ${className}`}>
      <header className="flex flex-col gap-3 border-b border-neutral-800 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2 id={headingId} className="font-display text-xl leading-none text-paper">
            {title}
          </h2>
          {description && <p className="mt-2 text-xs leading-5 text-neutral-500">{description}</p>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </header>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

export const ErrorText = ({ children, className = "" }) => (children ? <p className={`text-xs text-red-500 ${className}`}>{children}</p> : null);
