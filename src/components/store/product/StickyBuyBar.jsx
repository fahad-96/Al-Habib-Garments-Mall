import React from "react";
import Button from "../../ui/Button";
import Price from "../../ui/Price";

// Mobile-only bar that slides up once the main CTA has scrolled out of view.
// Right padding keeps clear of the floating WhatsApp button that sits in the same corner.
export default function StickyBuyBar({ visible, product, size, unavailable = false, onAdd, onWhatsApp }) {
  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-soft lg:hidden ${visible ? "translate-y-0" : "pointer-events-none translate-y-full"}`} aria-hidden={!visible}>
      <div className="safe-bottom border-t border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/90">
        <div className="flex items-center gap-4 py-3 pl-4 pr-[4.75rem]">
          <div className="min-w-0 flex-1">
            <p className="truncate text-2xs font-medium uppercase tracking-micro text-neutral-500">{size ? `Size ${size}` : "Select a size"}</p>
            <Price price={product.price} mrp={product.mrp} size="md" showDiscount={false} />
          </div>
          <Button onClick={unavailable ? onWhatsApp : onAdd} className="shrink-0" tabIndex={visible ? 0 : -1}>
            {unavailable ? "Ask on WhatsApp" : "Add to bag"}
          </Button>
        </div>
      </div>
    </div>
  );
}
