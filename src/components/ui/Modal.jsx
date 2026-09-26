import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useLockBody } from "../../hooks/useLockBody";

export default function Modal({ open, onClose, title, children, size = "md", dark = false, footer = null }) {
  useLockBody(open);
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => (panel.current?.querySelector("[data-autofocus], input:not([type=hidden]), select, textarea") || panel.current?.querySelector("button, [href]"))?.focus(), 30);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden shadow-pop ${widths[size] || widths.md} ${dark ? "bg-neutral-950 text-paper border border-neutral-800" : "bg-paper text-ink"}`}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {(title || onClose) && (
              <div className={`flex items-center justify-between gap-4 px-5 py-4 ${dark ? "border-b border-neutral-800" : "border-b border-line"}`}>
                <h2 className="font-display text-xl leading-none">{title}</h2>
                {onClose && (
                  <button type="button" onClick={onClose} className="-mr-2 p-2 hover:opacity-60" aria-label="Close">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className={`px-5 py-4 ${dark ? "border-t border-neutral-800" : "border-t border-line"}`}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
