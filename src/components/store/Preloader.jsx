import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const KEY = "ahgm-preloaded";

export default function Preloader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem(KEY);
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!show) return undefined;
    const t = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
    }, reduce ? 200 : 1100);
    return () => clearTimeout(t);
  }, [show, reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink text-paper" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }} aria-hidden="true">
          <div className="overflow-hidden text-center">
            <motion.p className="font-brand text-5xl sm:text-6xl" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              Al Habib
            </motion.p>
            <motion.p className="mt-2 text-[10px] font-medium uppercase tracking-[0.4em] text-neutral-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              Garments Mall
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
