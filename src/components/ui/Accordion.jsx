import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

export function AccordionItem({ title, children, defaultOpen = false, dark = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={dark ? "border-b border-neutral-800" : "border-b border-line"}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-left" aria-expanded={open}>
        <span className="text-[13px] font-medium uppercase tracking-micro">{title}</span>
        {open ? <Minus className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pb-5 text-sm leading-relaxed text-neutral-700">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Accordion({ children, className = "" }) {
  return <div className={`border-t border-line ${className}`}>{children}</div>;
}
