import React, { useEffect, useId, useState } from "react";
import { Lock } from "lucide-react";
import { DEPARTMENTS, SIZE_SETS } from "../../../data/catalog";
import { slugify } from "../../../lib/format";
import { Input, Select, Textarea, Toggle } from "../../ui/Fields";
import ImageUploader from "../ImageUploader";
import EditorModal from "./EditorModal";
import { SLUG_RE, ToggleBox } from "./bits";

const blank = (department, sortOrder) => ({ department, slug: "", name: "", sizeSet: "apparel", description: "", imageUrl: "", sortOrder, isActive: true });

const cleanSlugInput = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").slice(0, 80);

// New rows get key = department-slug. Existing rows keep it: products point at the key, so the
// department and slug are locked and only the name, art, size set, order and visibility change.
export default function CategoryEditor({ open, item, department = "men", existingKeys, defaultSortOrder = 10, onClose, onSave }) {
  const isNew = !item;
  const slugId = useId();
  const [draft, setDraft] = useState(() => item || blank(department, defaultSortOrder));
  const [slugPinned, setSlugPinned] = useState(Boolean(item));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(item ? { ...item } : blank(department, defaultSortOrder));
    setSlugPinned(Boolean(item));
    setErrors({});
    setError("");
    setBusy(false);
  }, [open, item, department, defaultSortOrder]);

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));
  const setName = (name) => patch({ name, ...(slugPinned ? {} : { slug: slugify(name) }) });
  const setSlug = (value) => {
    const slug = cleanSlugInput(value);
    setSlugPinned(slug !== "");
    patch({ slug });
  };

  const key = `${draft.department}-${draft.slug}`;

  const validate = () => {
    const next = {};
    if (!draft.name.trim()) next.name = "Give the category a name.";
    if (!draft.slug) next.slug = "Add a slug. It becomes part of the web address.";
    else if (!SLUG_RE.test(draft.slug)) next.slug = "Use lowercase letters, numbers and single dashes.";
    else if (isNew && existingKeys?.has(key)) next.slug = `${key} already exists. Pick another slug.`;
    return next;
  };

  const submit = async () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setError("");
    try {
      await onSave({ ...draft, key, name: draft.name.trim(), description: draft.description.trim(), sortOrder: Number(draft.sortOrder) || 0 });
      onClose?.();
    } catch (e) {
      setError(e?.message || "Could not save the category.");
      setBusy(false);
    }
  };

  return (
    <EditorModal open={open} onClose={onClose} title={isNew ? "New category" : "Edit category"} busy={busy} error={error} hint={isNew ? "" : "Changes reach the store as soon as you save."} submitLabel={isNew ? "Create category" : "Save changes"} onSubmit={submit}>
      <div className="space-y-5">
        <Input dark label="Name" value={draft.name} onChange={(e) => setName(e.target.value)} placeholder="Jackets" maxLength={60} error={errors.name} autoComplete="off" />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select dark label="Department" value={draft.department} onChange={(e) => patch({ department: e.target.value })} disabled={!isNew} className={isNew ? "" : "opacity-60"}>
            {DEPARTMENTS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.name}
              </option>
            ))}
          </Select>
          <div>
            <label htmlFor={slugId} className="label label-dark">
              Slug
            </label>
            <div className="relative">
              <input
                id={slugId}
                value={draft.slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={!isNew}
                placeholder="jackets"
                spellCheck={false}
                autoComplete="off"
                aria-invalid={Boolean(errors.slug)}
                aria-describedby={`${slugId}-hint`}
                className={`field field-dark font-mono text-sm disabled:cursor-not-allowed disabled:opacity-60 ${isNew ? "" : "pr-10"} ${errors.slug ? "border-red-600" : ""}`}
              />
              {!isNew && <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />}
            </div>
            <p id={`${slugId}-hint`} className={`mt-1.5 text-xs ${errors.slug ? "text-red-500" : "text-neutral-500"}`}>
              {errors.slug || (isNew ? "Follows the name until you edit it." : "Fixed. Products point at the key.")}
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-3 border border-neutral-800 px-4 py-3 text-xs">
          <span className="shrink-0 text-2xs font-medium uppercase tracking-micro text-neutral-500">Key</span>
          <span className="min-w-0 truncate font-mono text-neutral-200">{draft.slug ? key : `${draft.department}-…`}</span>
          <span className="ml-auto hidden shrink-0 text-neutral-500 sm:inline">{isNew ? "Set once, on create" : "Cannot change"}</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Select dark label="Size set" value={draft.sizeSet} onChange={(e) => patch({ sizeSet: e.target.value })} hint="The default size range for products added here.">
            {Object.entries(SIZE_SETS).map(([k, set]) => (
              <option key={k} value={k}>
                {set.label}
              </option>
            ))}
          </Select>
          <Input dark type="number" inputMode="numeric" label="Sort order" value={draft.sortOrder} onChange={(e) => patch({ sortOrder: e.target.value })} hint="Lower numbers come first within the department." />
        </div>

        <Textarea dark label="Description" rows={3} value={draft.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Windbreakers, shells and fleece-lined layers." maxLength={240} />

        <ImageUploader label="Artwork" value={draft.imageUrl} onChange={(imageUrl) => patch({ imageUrl })} folder="categories" nameHint={draft.slug || "category"} hint="Portrait 3:4. Shown on the home page and the department pages." />

        <ToggleBox>
          <Toggle dark className="w-full" checked={draft.isActive} onChange={(isActive) => patch({ isActive })} label={draft.isActive ? "Visible on the store" : "Hidden from the store"} description={draft.isActive ? "Shows in navigation once it has products." : "Its products stay in place but the category is not listed."} />
        </ToggleBox>
      </div>
    </EditorModal>
  );
}
