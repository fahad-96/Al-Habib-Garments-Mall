import React from "react";

// lucide-react no longer ships brand glyphs; these are simple outline marks.
export function InstagramIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 8.5V6.8c0-.9.6-1.3 1.4-1.3H17V2.5h-2.6C11.6 2.5 10.5 4.4 10.5 6.6v1.9H8v3.2h2.5v9.8H14v-9.8h2.6l.4-3.2H14z" />
    </svg>
  );
}
