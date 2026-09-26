import React, { useId } from "react";
import { Lock, Unlock } from "lucide-react";
import { Input, Select, Textarea } from "../../ui/Fields";
import { BADGES, DEPARTMENTS } from "../../../data/catalog";
import { SHORT_INFO_MAX, TITLE_MAX } from "./productEditor";
import EditorSection from "./EditorSection";

export default function BasicsEditor({ editor, categories }) {
  const { product, errors, patch, setTitle, setSlug, slugPinned, toggleSlugPinned, setDepartment, setCategory } = editor;
  const slugId = useId();
  const inDepartment = categories.filter((c) => c.department === product.department);
  const hasCategory = inDepartment.some((c) => c.key === product.categoryKey);

  return (
    <EditorSection id="basics" title="Basics" description="What the product is called and where it sits in the store.">
      <div className="space-y-5">
        <Input dark label="Title" value={product.title} onChange={(e) => setTitle(e.target.value)} placeholder="Summit Hooded Windbreaker" maxLength={TITLE_MAX} error={errors.title} autoComplete="off" />

        <div>
          <label htmlFor={slugId} className="label label-dark">
            Slug
          </label>
          <div className="flex">
            <input
              id={slugId}
              value={product.slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`field field-dark min-w-0 flex-1 font-mono text-sm ${errors.slug ? "border-red-600" : ""}`}
              placeholder="summit-hooded-windbreaker"
              spellCheck={false}
              autoComplete="off"
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={`${slugId}-hint`}
            />
            <button
              type="button"
              onClick={toggleSlugPinned}
              aria-pressed={slugPinned}
              aria-label={slugPinned ? "Slug is pinned. Unpin it to follow the title." : "Slug follows the title. Pin it to keep it fixed."}
              title={slugPinned ? "Unpin slug" : "Pin slug"}
              className={`-ml-px flex w-12 shrink-0 items-center justify-center border transition-colors ${slugPinned ? "border-paper bg-paper text-ink" : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-paper"}`}
            >
              {slugPinned ? <Lock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> : <Unlock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
            </button>
          </div>
          <p id={`${slugId}-hint`} className={`mt-1.5 text-xs ${errors.slug ? "text-red-500" : "text-neutral-500"}`}>
            {errors.slug || (
              <>
                /product/<span className="text-neutral-300">{product.slug || "…"}</span>
                <span className="mx-1.5">·</span>
                {slugPinned ? "Pinned. Changing it changes the web address." : "Follows the title until you pin it."}
              </>
            )}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Select dark label="Department" value={product.department} onChange={(e) => setDepartment(e.target.value)}>
            {DEPARTMENTS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select dark label="Category" value={hasCategory ? product.categoryKey : ""} onChange={(e) => setCategory(e.target.value)} error={errors.categoryKey} hint={!errors.categoryKey ? "Sets the default size set." : undefined}>
            {!hasCategory && <option value="">Choose a category</option>}
            {inDepartment.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
                {c.isActive === false ? " (hidden)" : ""}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input dark label="Brand" value={product.brand} onChange={(e) => patch({ brand: e.target.value })} placeholder="Al Habib" autoComplete="off" />
          <Select dark label="Badge" value={product.badge} onChange={(e) => patch({ badge: e.target.value })} hint="Shown on the product card.">
            {BADGES.map((b) => (
              <option key={b || "none"} value={b}>
                {b || "None"}
              </option>
            ))}
          </Select>
        </div>

        <Input
          dark
          label="Short info"
          value={product.shortInfo}
          onChange={(e) => patch({ shortInfo: e.target.value })}
          placeholder="Light, wind-cutting shell with a drawcord hood."
          maxLength={SHORT_INFO_MAX}
          hint={`One line under the title on the card. ${product.shortInfo.length}/${SHORT_INFO_MAX}`}
        />
        <Textarea dark label="Description" rows={5} value={product.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Fabric, cut, how it wears and what it pairs with." />
      </div>
    </EditorSection>
  );
}
