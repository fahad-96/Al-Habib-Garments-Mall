import React from "react";
import { Select } from "../../ui/Fields";
import { SIZE_SETS } from "../../../data/catalog";
import EditorSection, { ErrorText } from "./EditorSection";

const textButton = "text-2xs font-medium uppercase tracking-micro text-neutral-400 transition-colors hover:text-paper";

export default function SizePicker({ editor }) {
  const { product, errors, setSizeSet, setSizes, toggleSize } = editor;
  const all = SIZE_SETS[product.sizeSet]?.sizes || [];
  const offered = new Set(product.sizes);

  return (
    <EditorSection
      id="sizes"
      title="Sizes"
      description="Pick the size set, then switch off any sizes you do not stock."
      aside={
        <div className="flex h-10 items-center gap-4">
          <button type="button" onClick={() => setSizes(all)} className={textButton}>
            All
          </button>
          <button type="button" onClick={() => setSizes([])} className={textButton}>
            None
          </button>
        </div>
      }
    >
      <Select dark label="Size set" value={product.sizeSet} onChange={(e) => setSizeSet(e.target.value)} hint="Changing the set resets the offered sizes." className="sm:max-w-xs">
        {Object.entries(SIZE_SETS).map(([key, set]) => (
          <option key={key} value={key}>
            {set.label}
          </option>
        ))}
      </Select>

      <div className="mt-6">
        <p className="label label-dark">
          Offered sizes <span className="ml-1 normal-case tracking-normal text-neutral-500">{product.sizes.length} of {all.length}</span>
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Offered sizes">
          {all.map((size) => {
            const on = offered.has(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                aria-pressed={on}
                className={`inline-flex h-10 min-w-[3rem] items-center justify-center border px-3 text-[13px] font-medium transition-colors ${on ? "border-paper bg-paper text-ink" : "border-neutral-700 text-neutral-400 hover:border-neutral-400 hover:text-paper"}`}
              >
                {size}
              </button>
            );
          })}
        </div>
        <ErrorText className="mt-2">{errors.sizes}</ErrorText>
        {!errors.sizes && <p className="mt-2 text-xs text-neutral-500">Sizes you switch off keep their stock until you save.</p>}
      </div>
    </EditorSection>
  );
}
