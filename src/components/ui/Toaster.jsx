import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, AlertTriangle, X } from "lucide-react";
import { useShop } from "../../context/ShopContext";

const ICONS = { success: Check, info: Info, error: AlertTriangle };

export default function Toaster() {
  const { toasts, dismissToast } = useShop();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex max-w-md items-center gap-3 bg-ink px-4 py-3 text-sm text-paper shadow-pop"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{t.message}</span>
              {t.action && (
                <button type="button" onClick={() => { t.action.onClick?.(); dismissToast(t.id); }} className="-my-2 inline-flex h-10 shrink-0 items-center px-2 text-2xs font-medium uppercase tracking-micro underline underline-offset-4">
                  {t.action.label}
                </button>
              )}
              <button type="button" onClick={() => dismissToast(t.id)} className="-my-2 -ml-1 -mr-3 inline-flex h-10 w-10 shrink-0 items-center justify-center opacity-70 hover:opacity-100" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
