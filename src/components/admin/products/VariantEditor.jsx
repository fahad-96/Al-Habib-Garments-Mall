import React from "react";
import { Plus } from "lucide-react";
import EditorSection, { ErrorText } from "./EditorSection";
import VariantCard from "./VariantCard";

export default function VariantEditor({ editor }) {
  const { product, errors, updateVariant, addVariant, removeVariant, moveVariant } = editor;
  const count = product.variants.length;

  return (
    <EditorSection
      id="variants"
      title="Colours"
      description="Each colour has its own photos and stock per size."
      aside={
        <button type="button" onClick={addVariant} className="btn btn-inverse-outline btn-sm">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Add colour
        </button>
      }
    >
      <ErrorText className="mb-4">{errors.variants}</ErrorText>
      {count === 0 ? (
        <button type="button" onClick={addVariant} className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-neutral-700 py-10 text-neutral-400 transition-colors hover:border-neutral-400 hover:text-paper">
          <Plus className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-xs">Add the first colour</span>
        </button>
      ) : (
        <div className="space-y-4">
          {product.variants.map((variant, index) => (
            <VariantCard
              key={variant._key}
              variant={variant}
              index={index}
              count={count}
              sizes={product.sizes}
              slug={product.slug}
              error={errors[`variant-${index}`]}
              onChange={(changes) => updateVariant(variant._key, changes)}
              onRemove={() => removeVariant(variant._key)}
              onMove={(dir) => moveVariant(variant._key, dir)}
            />
          ))}
        </div>
      )}
    </EditorSection>
  );
}
