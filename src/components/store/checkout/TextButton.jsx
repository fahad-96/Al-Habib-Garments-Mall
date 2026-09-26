import React from "react";

// Small tracked text action used across bag, wishlist and coupon rows. Keeps a 40px hit area.
export default function TextButton({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center text-2xs font-medium uppercase tracking-micro text-neutral-500 underline-offset-4 transition-colors hover:text-ink hover:underline disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
