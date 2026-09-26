import React from "react";
import { Input, Toggle } from "../../ui/Fields";
import EditorSection from "./EditorSection";

export default function VisibilityEditor({ editor }) {
  const { product, patch } = editor;
  return (
    <EditorSection id="visibility" title="Visibility" description="Hidden products stay here in the admin but never appear on the store.">
      <div className="grid gap-5 sm:grid-cols-2 sm:items-start">
        <div className="border border-neutral-800 px-4 py-3.5">
          <Toggle dark checked={product.isActive} onChange={(isActive) => patch({ isActive })} label={product.isActive ? "Visible on the store" : "Hidden from the store"} description={product.isActive ? "Customers can find and order it." : "Only you can see it."} />
        </div>
        <Input dark type="number" inputMode="numeric" label="Sort order" value={product.sortOrder} onChange={(e) => patch({ sortOrder: e.target.value === "" ? 0 : Math.round(Number(e.target.value) || 0) })} hint="Lower numbers appear first within a category." />
      </div>
    </EditorSection>
  );
}
