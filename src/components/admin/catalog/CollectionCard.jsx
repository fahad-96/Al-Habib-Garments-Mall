import React from "react";
import { productImage } from "../../../lib/catalogUtils";
import { pluralize } from "../../../lib/format";
import { ArtThumb, LivePill, RowActions } from "./bits";

const PREVIEW_COUNT = 5;

export default function CollectionCard({ collection: c, products, onEdit, onDelete }) {
  const total = c.productSlugs?.length || 0;
  const missing = total - products.length;
  const preview = products.slice(0, PREVIEW_COUNT);
  return (
    <article className={`admin-card flex min-w-0 gap-4 p-4 ${c.isActive ? "" : "text-neutral-400"}`}>
      <ArtThumb src={c.imageUrl} className="h-24 w-[72px] sm:h-[124px] sm:w-[93px]" label={c.name?.slice(0, 1)} dim={!c.isActive} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className={`line-clamp-2 font-display text-xl leading-tight ${c.isActive ? "text-paper" : "text-neutral-400"}`}>{c.name || "Untitled collection"}</h3>
            <p className="mt-1 truncate font-mono text-xs text-neutral-500">/collections/{c.slug}</p>
          </div>
          <LivePill active={c.isActive} className="mt-0.5" />
        </div>
        {c.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-400">{c.description}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="min-w-0">
            {preview.length > 0 && (
              <div className="flex items-center gap-1" aria-hidden="true">
                {preview.map((p) => (
                  <ArtThumb key={p.slug} src={productImage(p)} className="h-8 w-6" />
                ))}
                {total > PREVIEW_COUNT && <span className="ml-1 text-2xs tabular-nums text-neutral-500">+{total - PREVIEW_COUNT}</span>}
              </div>
            )}
            <p className="mt-1.5 text-xs leading-5 text-neutral-400">
              {pluralize(total, "product")}
              {missing > 0 && ` · ${missing} not on the store`}
              <span className="mx-1.5">·</span>Sort {c.sortOrder}
            </p>
          </div>
          <RowActions name={c.name || "collection"} onEdit={onEdit} onDelete={onDelete} className="-mb-2 -mr-2" />
        </div>
      </div>
    </article>
  );
}
