import React, { useState } from "react";
import Button from "../../ui/Button";
import ConfirmDialog from "../ConfirmDialog";
import { useProductEditor } from "./useProductEditor";
import BasicsEditor from "./BasicsEditor";
import PricingEditor from "./PricingEditor";
import SizePicker from "./SizePicker";
import VariantEditor from "./VariantEditor";
import DetailsEditor from "./DetailsEditor";
import TagsEditor from "./TagsEditor";
import VisibilityEditor from "./VisibilityEditor";
import EditorRail from "./EditorRail";

// The whole editor for one product. Mount it with key={product.id || "new"}
// so a freshly created product (or a duplicate) starts from its saved state.
export default function ProductForm({ initial, categories, onSaved }) {
  const editor = useProductEditor(initial, { onSaved });
  const { product, patch, dirty, saving, submit, remove, baseline } = editor;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_296px] lg:items-start xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <BasicsEditor editor={editor} categories={categories} />
          <PricingEditor editor={editor} />
          <SizePicker editor={editor} />
          <VariantEditor editor={editor} />
          <DetailsEditor details={product.details} onChange={(details) => patch({ details })} />
          <TagsEditor tags={product.tags} onChange={(tags) => patch({ tags })} />
          <VisibilityEditor editor={editor} />
        </div>
        <EditorRail editor={editor} onDelete={() => setConfirmDelete(true)} />
      </div>

      {/* Mobile: the save action stays within thumb reach. */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-neutral-800 bg-ink/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-xs text-neutral-400" aria-hidden="true">
            {dirty ? "Unsaved changes" : baseline.id ? "All changes saved" : "Nothing saved yet"}
          </p>
          <Button type="submit" variant="inverse" size="md" loading={saving} className="min-w-[9.5rem]">
            {baseline.id ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title="Delete this product?"
        description={`${baseline.title || "This product"} will be removed from the store and the admin. Past orders keep their own copy of the details.`}
        confirmLabel="Delete"
        danger
      />
    </form>
  );
}
