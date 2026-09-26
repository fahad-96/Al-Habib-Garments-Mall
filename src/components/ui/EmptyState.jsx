import React from "react";

// `as` sets the heading level: h2 under a page's h1 (the default), h3 inside a section, p where no heading fits.
export default function EmptyState({ icon: Icon, title, description, action, className = "", dark = false, as: Heading = "h2" }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-20 text-center ${className}`}>
      {Icon && (
        <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${dark ? "bg-neutral-900 text-neutral-400" : "bg-neutral-100 text-neutral-500"}`}>
          <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}
      <Heading className="font-display text-2xl">{title}</Heading>
      {description && <p className={`mt-2 max-w-sm text-sm ${dark ? "text-neutral-400" : "text-neutral-500"}`}>{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
