import React from "react";
import BannerPreview from "./BannerPreview";
import { LivePill, RowActions } from "./bits";

const pad = (n) => String(n).padStart(2, "0");

export default function BannerCard({ banner: b, index, onEdit, onDelete }) {
  const dark = b.theme !== "light";
  return (
    <article className="admin-card min-w-0">
      <div className="relative">
        <BannerPreview banner={b} className={b.isActive ? "" : "opacity-50"} />
        <span className={`absolute left-3 top-3 px-1.5 py-0.5 text-[10px] font-medium tabular-nums tracking-micro ${dark ? "bg-paper text-ink" : "bg-ink text-paper"}`} aria-label={`Position ${index + 1}`}>
          {pad(index + 1)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className={`truncate text-sm font-medium ${b.isActive ? "text-paper" : "text-neutral-400"}`}>{b.title || "Untitled banner"}</p>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            Sort {b.sortOrder}
            <span className="mx-1.5">·</span>
            {b.ctaLabel && b.ctaLink ? (
              <>
                {b.ctaLabel} <span className="font-mono">{b.ctaLink}</span>
              </>
            ) : (
              "No button"
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LivePill active={b.isActive} />
          <RowActions name={b.title || "banner"} onEdit={onEdit} onDelete={onDelete} className="-mr-2" />
        </div>
      </div>
    </article>
  );
}
