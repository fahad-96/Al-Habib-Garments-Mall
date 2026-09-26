import { useEffect, useState } from "react";

// True while the element (plus `offset` px) fits inside the viewport height.
// Used to make the bag's summary column sticky only when sticking will not clip it.
export function useFitsViewport(ref, offset = 0) {
  const [fits, setFits] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return undefined;
    const check = () => setFits(el.offsetHeight + offset <= window.innerHeight);
    check();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(check) : null;
    ro?.observe(el);
    window.addEventListener("resize", check);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [ref, offset]);
  return fits;
}

// True while the element is on screen. Used to hide the mobile checkout bar
// once the real "Place order" button has scrolled into view.
export function useInView(ref, rootMargin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
