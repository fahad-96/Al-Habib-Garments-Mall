import React, { useEffect, useId, useMemo, useState } from "react";
import { useShop } from "../../../context/ShopContext";
import { DEPARTMENTS } from "../../../data/catalog";
import { slugify } from "../../../lib/format";
import { Input, Select, Textarea, Toggle } from "../../ui/Fields";
import ImageUploader from "../ImageUploader";
import EditorModal from "./EditorModal";
import BannerPreview from "./BannerPreview";
import { ToggleBox } from "./bits";

export const PLACEMENTS = [
  { key: "hero", label: "Hero", hint: "Full-height slides at the top of the home page. They rotate in sort order." },
  { key: "strip", label: "Strip", hint: "The wide band lower on the home page. Only the first active one shows." },
];

const blank = (placement, sortOrder) => ({ placement, title: "", subtitle: "", ctaLabel: "", ctaLink: "", imageUrl: "", theme: "dark", sortOrder, isActive: true });

const isSiteLink = (s) => /^\/(?!\/)/.test(s) || /^https?:\/\//i.test(s);

export default function BannerEditor({ open, item, placement = "hero", defaultSortOrder = 10, onClose, onSave }) {
  const { categories, collections } = useShop();
  const isNew = !item;
  const linksId = useId();
  const [draft, setDraft] = useState(() => item || blank(placement, defaultSortOrder));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(item ? { ...item } : blank(placement, defaultSortOrder));
    setErrors({});
    setError("");
    setBusy(false);
  }, [open, item, placement, defaultSortOrder]);

  // Site paths the button can point at: departments, categories and collections in the catalog.
  const links = useMemo(() => {
    const out = ["/shop", "/new", "/sale", "/collections"];
    DEPARTMENTS.forEach((d) => out.push(`/shop/${d.key}`));
    collections.forEach((c) => out.push(`/collections/${c.slug}`));
    categories.forEach((c) => out.push(`/shop/${c.department}/${c.slug}`));
    return Array.from(new Set(out));
  }, [categories, collections]);

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const validate = () => {
    const next = {};
    const label = draft.ctaLabel.trim();
    const link = draft.ctaLink.trim();
    if (!draft.title.trim()) next.title = "Give the banner a headline.";
    if (label && !link) next.ctaLink = "Add a link for the button.";
    else if (link && !isSiteLink(link)) next.ctaLink = "Use a site path like /shop/women or a full https:// link.";
    if (link && !label) next.ctaLabel = "Add a label for the button.";
    return next;
  };

  const submit = async () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setError("");
    try {
      await onSave({ ...draft, title: draft.title.trim(), subtitle: draft.subtitle.trim(), ctaLabel: draft.ctaLabel.trim(), ctaLink: draft.ctaLink.trim(), sortOrder: Number(draft.sortOrder) || 0 });
      onClose?.();
    } catch (e) {
      setError(e?.message || "Could not save the banner.");
      setBusy(false);
    }
  };

  const place = PLACEMENTS.find((p) => p.key === draft.placement) || PLACEMENTS[0];

  return (
    <EditorModal open={open} onClose={onClose} title={isNew ? "New banner" : "Edit banner"} size="lg" busy={busy} error={error} hint={place.hint} submitLabel={isNew ? "Create banner" : "Save changes"} onSubmit={submit}>
      <div className="mb-6">
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <p className="label label-dark mb-0">Preview</p>
          <p className="text-xs text-neutral-500">
            {place.label} · {draft.theme === "light" ? "light art, black text" : "dark art, white text"}
          </p>
        </div>
        <BannerPreview banner={draft} className="border border-neutral-800" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Select dark label="Placement" value={draft.placement} onChange={(e) => patch({ placement: e.target.value })}>
          {PLACEMENTS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </Select>
        <Select dark label="Theme" value={draft.theme} onChange={(e) => patch({ theme: e.target.value })} hint="Pick the one that keeps the text readable over the art.">
          <option value="dark">Dark art, white text</option>
          <option value="light">Light art, black text</option>
        </Select>

        <Input dark className="sm:col-span-2" label="Headline" value={draft.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Winter, layered." maxLength={80} error={errors.title} autoComplete="off" />
        <Textarea dark className="sm:col-span-2" label="Subtitle" rows={2} value={draft.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} placeholder="Jackets, hoodies and fleece built for Kunzer's cold." maxLength={160} />

        <Input dark label="Button label" value={draft.ctaLabel} onChange={(e) => patch({ ctaLabel: e.target.value })} placeholder="Shop winter layers" maxLength={40} error={errors.ctaLabel} autoComplete="off" />
        <div>
          <Input dark label="Button link" value={draft.ctaLink} onChange={(e) => patch({ ctaLink: e.target.value })} placeholder="/collections/winter-layers" list={linksId} error={errors.ctaLink} hint="A site path like /collections/winter-edit or /shop/women." autoComplete="off" spellCheck={false} className="[&_input]:font-mono [&_input]:text-sm" />
          <datalist id={linksId}>
            {links.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </div>

        {/* Full row and wider tiles: the uploader's five-column grid would shrink a 16:9 tile to a sliver. */}
        <div className="sm:col-span-2 [&_.grid]:!grid-cols-3 sm:[&_.grid]:!grid-cols-4">
          <ImageUploader label="Artwork" value={draft.imageUrl} onChange={(imageUrl) => patch({ imageUrl })} folder="banners" nameHint={slugify(draft.title) || "banner"} aspect="aspect-video" hint="Wide 16:9, at least 1600px across. The hero crops to the screen, so keep the subject centred." />
        </div>
        <div className="grid gap-5 sm:col-span-2 sm:grid-cols-2 sm:items-end">
          <Input dark type="number" inputMode="numeric" label="Sort order" value={draft.sortOrder} onChange={(e) => patch({ sortOrder: e.target.value })} hint="Lower numbers come first." />
          <ToggleBox className="mb-[1.375rem] sm:mb-[1.4rem]">
            <Toggle dark className="w-full" checked={draft.isActive} onChange={(isActive) => patch({ isActive })} label={draft.isActive ? "Visible on the store" : "Hidden from the store"} />
          </ToggleBox>
        </div>
      </div>
    </EditorModal>
  );
}
