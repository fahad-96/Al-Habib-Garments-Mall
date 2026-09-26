import React, { useId } from "react";
import { discountPercent, formatINR } from "../../../lib/format";
import EditorSection from "./EditorSection";

function MoneyInput({ label, value, onChange, error, hint }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label label-dark">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500" aria-hidden="true">
          ₹
        </span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={value || ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(0, Math.floor(Number(e.target.value) || 0)))}
          placeholder="0"
          className={`field field-dark pl-9 tabular-nums ${error ? "border-red-600" : ""}`}
          aria-invalid={Boolean(error)}
        />
      </div>
      {error ? <p className="mt-1.5 text-xs text-red-500">{error}</p> : hint ? <p className="mt-1.5 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

export default function PricingEditor({ editor }) {
  const { product, errors, patch } = editor;
  const price = Number(product.price) || 0;
  const mrp = Number(product.mrp) || 0;
  const off = discountPercent(mrp, price);

  return (
    <EditorSection id="pricing" title="Pricing" description="Whole rupees. The discount is worked out for you.">
      <div className="grid gap-5 sm:grid-cols-2">
        <MoneyInput label="MRP" value={product.mrp} onChange={(v) => patch({ mrp: v })} error={errors.mrp} hint="The printed maximum retail price." />
        <MoneyInput label="Selling price" value={product.price} onChange={(v) => patch({ price: v })} error={errors.price} hint="What the customer pays." />
      </div>
      <div className="mt-6 border-t border-neutral-800 pt-5" aria-live="polite">
        <p className="eyebrow-dark">Customers see</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-3xl leading-none tabular-nums text-paper">{formatINR(price)}</span>
          {off > 0 ? (
            <>
              <span className="text-sm tabular-nums text-neutral-500 line-through">{formatINR(mrp)}</span>
              <span className="text-2xs font-medium uppercase tracking-micro text-neutral-300">{off}% off</span>
            </>
          ) : (
            <span className="text-xs text-neutral-500">{price > 0 && mrp > price ? "" : "No discount shown"}</span>
          )}
        </div>
      </div>
    </EditorSection>
  );
}
