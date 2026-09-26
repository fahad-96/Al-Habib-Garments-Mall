import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useLockBody } from "../../hooks/useLockBody";

// Slide-in panel. side: "right" | "left" | "bottom".
export default function Drawer({ open, onClose, side = "right", title, children, footer = null, width = "max-w-md", dark = false }) {
  useLockBody(open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const pos = {
    right: { cls: `right-0 top-0 h-full w-full ${width}`, from: { x: "100%" }, to: { x: 0 } },
    left: { cls: `left-0 top-0 h-full w-full ${width}`, from: { x: "-100%" }, to: { x: 0 } },
    bottom: { cls: "bottom-0 left-0 w-full max-h-[88vh] rounded-t-lg", from: { y: "100%" }, to: { y: 0 } },
  }[side];

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.button type="button" aria-label="Close" className="absolute inset-0 bg-ink/45" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            className={`absolute flex flex-col shadow-pop ${pos.cls} ${dark ? "bg-neutral-950 text-paper" : "bg-paper text-ink"}`}
            initial={pos.from}
            animate={pos.to}
            exit={pos.from}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {(title || onClose) && (
              <div className={`flex items-center justify-between px-5 py-4 ${dark ? "border-b border-neutral-800" : "border-b border-line"}`}>
                <h2 className="text-2xs font-medium uppercase tracking-micro">{title}</h2>
                <button type="button" onClick={onClose} className="-mr-2 p-2 hover:opacity-60" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className={`safe-bottom ${dark ? "border-t border-neutral-800" : "border-t border-line"}`}>{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
