import React from "react";
import { Ruler } from "lucide-react";
import Swatch from "../../ui/Swatch";
import { LOW_STOCK_AT, variantTotalStock } from "../../../lib/catalogUtils";
import { SIZE_SETS } from "../../../data/catalog";

const Label = ({ children }) => <p className="text-2xs font-medium uppercase tracking-micro text-neutral-600">{children}</p>;

export function ColorSelector({ variants = [], selected, onSelect }) {
  if (!variants.length) return null;
  const soldOut = selected ? variantTotalStock(selected) <= 0 : false;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <Label>Colour</Label>
        {selected && (
          <p className="text-sm text-ink">
            {selected.color}
            {soldOut && <span className="text-neutral-500"> · Sold out</span>}
          </p>
        )}
      </div>
      <div className="-ml-1.5 mt-2.5 flex flex-wrap gap-0.5" role="group" aria-label="Colour">
        {variants.map((v) => {
          const out = variantTotalStock(v) <= 0;
          const active = selected?.color === v.color;
          return (
            <button key={v.color} type="button" onClick={() => onSelect(v.color)} aria-label={`${v.color}${out ? ", sold out" : ""}`} aria-pressed={active} className="flex h-12 w-12 items-center justify-center rounded-full">
              <Swatch as="span" hex={v.hex} name={v.color} selected={active} soldOut={out} size="lg" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SizeSelector({ ref, sizes = [], sizeSet, selected, stockFor, onSelect, error = false, colorName = "", colorSoldOut = false, productSoldOut = false, onSizeGuide }) {
  if (!sizes.length) return null;
  const stock = selected ? stockFor(selected) : 0;
  const setLabel = SIZE_SETS[sizeSet]?.label;
  const showSet = setLabel && sizeSet !== "apparel" && sizeSet !== "free";

  let note = null;
  if (error) note = <p role="alert" className="font-medium text-ink">Please select a size</p>;
  else if (productSoldOut) note = <p className="text-neutral-500">Sold out for now. Ask us on WhatsApp about a restock.</p>;
  else if (colorSoldOut) note = <p className="text-neutral-500">Sold out in {colorName}. Try another colour.</p>;
  else if (selected && stock > 0 && stock <= LOW_STOCK_AT) note = <p className="font-medium text-ink">Only {stock} left</p>;

  return (
    <div ref={ref} className="scroll-mt-28">
      <div className="flex items-baseline justify-between gap-4">
        <Label>
          Size
          {showSet && <span className="ml-2 normal-case tracking-normal text-neutral-400">{setLabel}</span>}
        </Label>
        <button type="button" onClick={onSizeGuide} className="inline-flex h-8 items-center gap-1.5 text-2xs font-medium uppercase tracking-micro underline underline-offset-4 hover:opacity-60">
          <Ruler className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Size guide
        </button>
      </div>
      <div className={`mt-2.5 flex flex-wrap gap-2 ${error ? "outline outline-1 outline-offset-8 outline-ink" : ""}`} role="group" aria-label="Size">
        {sizes.map((s) => {
          const out = stockFor(s) <= 0;
          const active = s === selected;
          return (
            <button key={s} type="button" disabled={out} onClick={() => onSelect(s)} aria-pressed={active} aria-label={out ? `${s}, sold out` : s} className={`chip min-w-[3rem] ${active ? "chip-active" : ""} ${out ? "chip-disabled" : ""}`}>
              {s}
            </button>
          );
        })}
      </div>
      <div className="mt-3 min-h-[1.25rem] text-xs" aria-live="polite">
        {note}
      </div>
    </div>
  );
}

export default function VariantSelector({ product, selection, productSoldOut = false, onSizeGuide, sizeRef }) {
  return (
    <div className="space-y-7">
      <ColorSelector variants={product.variants} selected={selection.variant} onSelect={selection.setColor} />
      <SizeSelector
        ref={sizeRef}
        sizes={selection.sizes}
        sizeSet={product.sizeSet}
        selected={selection.size}
        stockFor={selection.stockFor}
        onSelect={selection.setSize}
        error={selection.sizeError}
        colorName={selection.variant?.color}
        colorSoldOut={selection.colorSoldOut}
        productSoldOut={productSoldOut}
        onSizeGuide={onSizeGuide}
      />
    </div>
  );
}
