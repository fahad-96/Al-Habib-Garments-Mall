import React, { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

// Disclosure section. The trigger sits inside a heading (level 2 by default, as on the product page
// where it follows the h1) so each section is reachable by heading navigation.
export function AccordionItem({ title, children, defaultOpen = false, dark = false, level = 2 }) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  const id = useId();
  const buttonId = `${id}-trigger`;
  const panelId = `${id}-panel`;
  const Heading = `h${Math.min(6, Math.max(2, Number(level) || 2))}`;
  return (
    <div className={dark ? "border-b border-neutral-800" : "border-b border-line"}>
      <Heading>
        <button id={buttonId} type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-left" aria-expanded={open} aria-controls={panelId}>
          <span className="text-[13px] font-medium uppercase tracking-micro">{title}</span>
          {open ? <Minus className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        </button>
      </Heading>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className={`pb-5 text-sm leading-relaxed ${dark ? "text-neutral-300" : "text-neutral-700"}`}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Accordion({ children, className = "" }) {
  return <div className={`border-t border-line ${className}`}>{children}</div>;
}
