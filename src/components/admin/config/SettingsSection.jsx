import React from "react";

// Heading on the left, dark card of fields on the right (stacked on phones).
export default function SettingsSection({ id, title, description, children }) {
  const headingId = `section-${id}-title`;
  return (
    <section id={`section-${id}`} aria-labelledby={headingId} className="grid scroll-mt-20 gap-4 border-t border-neutral-800 py-8 first:border-t-0 first:pt-0 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:scroll-mt-8 lg:py-10">
      <div className="lg:sticky lg:top-8 lg:self-start">
        <h2 id={headingId} className="font-display text-2xl leading-none text-paper">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-md text-xs leading-5 text-neutral-500 lg:mt-3">{description}</p>}
      </div>
      <div className="admin-card px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}
