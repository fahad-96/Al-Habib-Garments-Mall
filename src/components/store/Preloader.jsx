import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const KEY = "ahgm-preloaded";
const HOLD_MS = 700;
const HOLD_REDUCED_MS = 250;

// Path the tab first opened on. Deep links (a product shared on WhatsApp, a listing, the bag,
// order tracking) go straight to the page; the brand moment belongs to the home page only.
const entryPath = typeof window === "undefined" ? "" : window.location.pathname;

const seen = () => {
  try {
    return Boolean(sessionStorage.getItem(KEY) || localStorage.getItem(KEY));
  } catch {
    return true;
  }
};

const remember = () => {
  try {
    sessionStorage.setItem(KEY, "1");
    localStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
};

// Shown once per visitor, on a first visit that lands on the home page.
export default function Preloader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => entryPath === "/" && window.location.pathname === "/" && !seen());

  useEffect(() => {
    if (!show) return undefined;
    remember();
    const t = setTimeout(() => setShow(false), reduce ? HOLD_REDUCED_MS : HOLD_MS);
    return () => clearTimeout(t);
  }, [show, reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink text-paper" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} aria-hidden="true">
          <div className="overflow-hidden text-center">
            <motion.p className="font-brand text-5xl sm:text-6xl" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              Al Habib
            </motion.p>
            <motion.p className="mt-2 text-[10px] font-medium uppercase tracking-[0.4em] text-neutral-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.35 }}>
              Garments Mall
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
