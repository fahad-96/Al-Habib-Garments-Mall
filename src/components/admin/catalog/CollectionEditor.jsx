import React, { useEffect, useId, useState } from "react";
import { useShop } from "../../../context/ShopContext";
import { slugify } from "../../../lib/format";
import { Input, Textarea, Toggle } from "../../ui/Fields";
import ImageUploader from "../ImageUploader";
import EditorModal from "./EditorModal";
import ProductPicker from "./ProductPicker";
import { SLUG_RE, ToggleBox } from "./bits";

const blank = (sortOrder) => ({ slug: "", name: "", description: "", imageUrl: "", productSlugs: [], sortOrder, isActive: true });

const cleanSlugInput = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").slice(0, 80);

export default function CollectionEditor({ open, item, existing = [], defaultSortOrder = 10, onClose, onSave }) {
  const { products, categories } = useShop();
  const isNew = !item;
  const slugId = useId();
  const [draft, setDraft] = useState(() => item || blank(defaultSortOrder));
  const [slugPinned, setSlugPinned] = useState(Boolean(item));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(item ? { ...item, productSlugs: [...(item.productSlugs || [])] } : blank(defaultSortOrder));
    setSlugPinned(Boolean(item));
    setErrors({});
    setError("");
    setBusy(false);
  }, [open, item, defaultSortOrder]);

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));
  const setName = (name) => patch({ name, ...(slugPinned ? {} : { slug: slugify(name) }) });
  const setSlug = (value) => {
    const slug = cleanSlugInput(value);
    setSlugPinned(slug !== "");
    patch({ slug });
  };

  const validate = () => {
    const next = {};
    if (!draft.name.trim()) next.name = "Give the collection a name.";
    if (!draft.slug) next.slug = "Add a slug. It becomes the web address.";
    else if (!SLUG_RE.test(draft.slug)) next.slug = "Use lowercase letters, numbers and single dashes.";
    else if (existing.some((c) => c.slug === draft.slug && c.id !== item?.id)) next.slug = "Another collection already uses this slug.";
    return next;
  };

  const submit = async () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setError("");
    try {
      await onSave({ ...draft, name: draft.name.trim(), description: draft.description.trim(), sortOrder: Number(draft.sortOrder) || 0 });
      onClose?.();
    } catch (e) {
      setError(e?.message || "Could not save the collection.");
      setBusy(false);
    }
  };

  return (
    <EditorModal open={open} onClose={onClose} title={isNew ? "New collection" : "Edit collection"} size="lg" busy={busy} error={error} hint={draft.slug ? `/collections/${draft.slug}` : ""} submitLabel={isNew ? "Create collection" : "Save changes"} onSubmit={submit}>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-6">
        <div className="space-y-5">
          <Input dark label="Name" value={draft.name} onChange={(e) => setName(e.target.value)} placeholder="Winter Layers" maxLength={60} error={errors.name} autoComplete="off" autoFocus />
          <div>
            <label htmlFor={slugId} className="label label-dark">
              Slug
            </label>
            <input
              id={slugId}
              value={draft.slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="winter-layers"
              spellCheck={false}
              autoComplete="off"
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={`${slugId}-hint`}
              className={`field field-dark font-mono text-sm ${errors.slug ? "border-red-600" : ""}`}
            />
            <p id={`${slugId}-hint`} className={`mt-1.5 text-xs ${errors.slug ? "text-red-500" : "text-neutral-500"}`}>
              {errors.slug || (isNew ? "Follows the name until you edit it." : "Changing it changes the web address.")}
            </p>
          </div>
          <Textarea dark label="Description" rows={3} value={draft.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Jackets, hoodies and fleece for the valley's cold." maxLength={240} />
          <ImageUploader label="Artwork" value={draft.imageUrl} onChange={(imageUrl) => patch({ imageUrl })} folder="collections" nameHint={draft.slug || "collection"} hint="Portrait 3:4. Shown on the collections page and the home page feature." />
          <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
            <Input dark type="number" inputMode="numeric" label="Sort order" value={draft.sortOrder} onChange={(e) => patch({ sortOrder: e.target.value })} hint="Lower numbers come first." />
            <ToggleBox className="mb-[1.375rem] sm:mb-[1.4rem]">
              <Toggle dark className="w-full" checked={draft.isActive} onChange={(isActive) => patch({ isActive })} label={draft.isActive ? "Visible" : "Hidden"} />
            </ToggleBox>
          </div>
        </div>
        <ProductPicker value={draft.productSlugs} onChange={(productSlugs) => patch({ productSlugs })} products={products} categories={categories} />
      </div>
    </EditorModal>
  );
}
