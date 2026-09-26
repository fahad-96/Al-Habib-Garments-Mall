import React from "react";
import { formatINR } from "../../../lib/format";
import Button from "../../ui/Button";

// Sticky bottom bar on phones. Submits the delivery form by id; leaves room on
// the right for the floating WhatsApp button that sits in the same corner.
export default function MobileCheckoutBar({ total, placing, formId, hidden = false }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur transition-transform duration-300 ease-soft lg:hidden ${hidden ? "translate-y-full" : ""}`}
      aria-hidden={hidden}
    >
      <div className="container flex items-center justify-between gap-4 py-5 pr-20 safe-bottom">
        <div>
          <p className="eyebrow">Total</p>
          <p className="text-base font-semibold tabular-nums">{formatINR(total)}</p>
        </div>
        <Button form={formId} type="submit" loading={placing} tabIndex={hidden ? -1 : undefined} className="min-w-[10.5rem]">
          Place order
        </Button>
      </div>
    </div>
  );
}
