import React from "react";
import Button from "../../ui/Button";

// Dark section card with a hairline header, shared by the config pages.
export default function ConfigCard({ id, title, description, aside, children, className = "", flush = false }) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={`admin-card scroll-mt-20 lg:scroll-mt-8 ${className}`}>
      {(title || aside) && (
        <header className="flex flex-col gap-3 border-b border-neutral-800 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 id={headingId} className="font-display text-xl leading-none text-paper">
                {title}
              </h2>
            )}
            {description && <p className="mt-2 text-xs leading-5 text-neutral-500">{description}</p>}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </header>
      )}
      <div className={flush ? "" : "px-5 py-5 sm:px-6 sm:py-6"}>{children}</div>
    </section>
  );
}

// Load failure with a retry, in the same voice as the other admin pages.
export function ErrorCard({ title = "This page could not load.", message, onRetry, loading = false, className = "" }) {
  return (
    <div className={`admin-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${className}`} role="alert">
      <div>
        <p className="text-sm text-paper">{title}</p>
        {message && <p className="mt-1 text-xs text-neutral-400">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="inverse-outline" size="sm" onClick={onRetry} loading={loading}>
          Try again
        </Button>
      )}
    </div>
  );
}

// Quiet uppercase text button used for secondary actions inside cards.
export const textButton = "inline-flex h-10 items-center text-2xs font-medium uppercase tracking-micro text-neutral-400 transition-colors hover:text-paper disabled:cursor-not-allowed disabled:opacity-40";
