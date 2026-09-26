import React from "react";
import { Heart, Share2 } from "lucide-react";
import Button from "../../ui/Button";
import QtyStepper from "../../ui/QtyStepper";
import WhatsAppIcon from "../../ui/WhatsAppIcon";

// Quantity, the primary "Add to bag" (or "Ask on WhatsApp" when nothing can be bought), wishlist and share.
export default function BuyActions({ ref, unavailable = false, qty, maxQty, onQty, onAdd, onWhatsApp, wished = false, onWish, onShare }) {
  return (
    <div ref={ref}>
      {!unavailable && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-2xs font-medium uppercase tracking-micro text-neutral-600">Quantity</span>
          <QtyStepper value={qty} onChange={onQty} max={maxQty} />
        </div>
      )}
      <div className={`flex gap-3 ${unavailable ? "" : "mt-6"}`}>
        {unavailable ? (
          <Button size="lg" className="min-w-0 flex-1" onClick={onWhatsApp}>
            <WhatsAppIcon className="h-4 w-4" color="#25D366" />
            Ask on WhatsApp
          </Button>
        ) : (
          <Button size="lg" className="min-w-0 flex-1" onClick={onAdd}>
            Add to bag
          </Button>
        )}
        <button
          type="button"
          onClick={onWish}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className="flex h-14 w-14 shrink-0 items-center justify-center border border-ink transition-colors duration-200 hover:bg-neutral-100"
        >
          <Heart className={`h-5 w-5 ${wished ? "fill-ink" : ""}`} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
      {!unavailable && (
        <Button size="lg" variant="secondary" full className="mt-3" onClick={onWhatsApp}>
          <WhatsAppIcon className="h-4 w-4" color="#25D366" />
          Buy on WhatsApp
        </Button>
      )}
      <div className="mt-4 flex items-center gap-6">
        <button type="button" onClick={onShare} className="inline-flex h-10 items-center gap-2 text-2xs font-medium uppercase tracking-micro hover:opacity-60">
          <Share2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Share
        </button>
      </div>
    </div>
  );
}
