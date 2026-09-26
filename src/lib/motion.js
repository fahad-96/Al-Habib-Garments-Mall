// Motion helpers shared by storefront code that scrolls or animates from JavaScript.
// CSS already honours prefers-reduced-motion; JS scroll calls must ask explicitly.

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Use as `behavior: scrollBehavior()` in scrollTo / scrollBy / scrollIntoView.
export const scrollBehavior = () => (prefersReducedMotion() ? "auto" : "smooth");
