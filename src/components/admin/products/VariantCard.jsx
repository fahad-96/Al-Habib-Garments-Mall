import React, { useId } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import ImageUploader from "../ImageUploader";
import { slugifyColor } from "../../../data/catalog";
import { pluralize } from "../../../lib/format";
import StockGrid from "./StockGrid";
import { ErrorText } from "./EditorSection";
import { COLOR_SUGGESTIONS, DEFAULT_HEX, HEX_PATTERN, hexForColorName } from "./productEditor";

const iconButton = "flex h-10 w-10 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400";

export default function VariantCard({ variant, index, count, sizes, slug, error, onChange, onRemove, onMove }) {
  const nameId = useId();
  const hexId = useId();
  const listId = useId();
  const validHex = HEX_PATTERN.test(String(variant.hex || "").trim());
  const swatch = validHex ? variant.hex : DEFAULT_HEX;
  const stockTotal = sizes.reduce((s, size) => s + Math.max(0, Number(variant.stock?.[size]) || 0), 0);
  const photos = (variant.images || []).length;

  const setColor = (color) => {
    const suggested = hexForColorName(color);
    // Only replace a hex that was never chosen by hand: the placeholder grey, or the swatch of the previous name.
    const untouched = !variant.hex || variant.hex === DEFAULT_HEX || variant.hex === hexForColorName(variant.color);
    onChange({ color, ...(suggested && untouched ? { hex: suggested } : {}) });
  };
  const setHex = (raw) => {
    let value = String(raw).trim().toLowerCase();
    if (value && !value.startsWith("#")) value = `#${value}`;
    onChange({ hex: value });
  };

  return (
    <article className={`border ${error ? "border-red-600/60" : "border-neutral-800"}`} aria-label={variant.color || `Colour ${index + 1}`}>
      <header className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3 sm:px-5">
        <span className="h-7 w-7 shrink-0 rounded-full border border-neutral-600" style={{ backgroundColor: swatch }} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-paper">{variant.color || `Colour ${index + 1}`}</p>
          <p className="truncate text-xs text-neutral-500">
            {stockTotal} in stock · {pluralize(photos, "photo")}
          </p>
        </div>
        <div className="flex items-center">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className={iconButton} aria-label="Move colour up">
            <ArrowUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className={iconButton} aria-label="Move colour down">
            <ArrowDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button type="button" onClick={onRemove} disabled={count <= 1} className={iconButton} aria-label="Remove colour" title={count <= 1 ? "A product needs at least one colour" : "Remove colour"}>
            <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="space-y-6 p-4 sm:p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={nameId} className="label label-dark">
              Colour name
            </label>
            <input id={nameId} list={listId} value={variant.color} onChange={(e) => setColor(e.target.value)} placeholder="Navy" autoComplete="off" className={`field field-dark ${error && !variant.color.trim() ? "border-red-600" : ""}`} />
            <datalist id={listId}>
              {COLOR_SUGGESTIONS.map(([name]) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor={hexId} className="label label-dark">
              Hex colour
            </label>
            <div className="relative">
              <label className="absolute left-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 cursor-pointer overflow-hidden rounded-full border border-neutral-600" style={{ backgroundColor: swatch }} title="Pick a colour">
                <input type="color" value={swatch} onChange={(e) => onChange({ hex: e.target.value })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Pick a colour" />
              </label>
              <input id={hexId} value={variant.hex} onChange={(e) => setHex(e.target.value)} placeholder="#1f2a44" maxLength={7} spellCheck={false} autoComplete="off" className={`field field-dark pl-12 font-mono text-sm ${error && !validHex ? "border-red-600" : ""}`} aria-invalid={!validHex} />
            </div>
          </div>
        </div>
        <ErrorText className="-mt-3">{error}</ErrorText>

        <ImageUploader
          multiple
          max={8}
          folder="products"
          nameHint={`${slug || "product"}-${slugifyColor(variant.color || "colour") || "colour"}`}
          value={variant.images}
          onChange={(images) => onChange({ images })}
          label="Photos"
          hint="Up to 8. The first is the main photo; 3:4 portrait works best."
        />

        <StockGrid sizes={sizes} stock={variant.stock} onChange={(stock) => onChange({ stock })} colorName={variant.color} />
      </div>
    </article>
  );
}
