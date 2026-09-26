import React from "react";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import Button from "../../ui/Button";
import StatusPill from "../StatusPill";
import { SIZE_SETS } from "../../../data/catalog";
import { formatINR, pluralize, timeAgo } from "../../../lib/format";

const Row = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-4 px-5 py-3">
    <dt className="text-2xs font-medium uppercase tracking-micro text-neutral-500">{label}</dt>
    <dd className="text-right text-sm text-neutral-200">{children}</dd>
  </div>
);

export default function EditorRail({ editor, onDelete }) {
  const { product, baseline, summary, dirty, saving, saveError, errorCount, attempted, duplicate } = editor;
  const saved = Boolean(baseline.id);
  const price = Number(product.price) || 0;
  const stockNote = summary.soldOut ? "Sold out" : summary.low ? "Low stock" : "";

  return (
    <aside className="lg:sticky lg:top-8" aria-label="Product summary and actions">
      <div className="admin-card">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-4">
          <h2 className="font-display text-xl leading-none text-paper">Summary</h2>
          <StatusPill tone={product.isActive ? "solid" : "muted"}>{product.isActive ? "Active" : "Hidden"}</StatusPill>
        </div>

        <dl className="divide-y divide-neutral-800">
          <Row label="Price">
            <span className="tabular-nums text-paper">{formatINR(price)}</span>
            {summary.discount > 0 && <span className="ml-2 text-xs text-neutral-500">{summary.discount}% off</span>}
          </Row>
          <Row label="Stock">
            <span className="tabular-nums text-paper">{summary.totalStock.toLocaleString("en-IN")}</span>
            {stockNote && <span className="ml-2 text-xs text-neutral-500">{stockNote}</span>}
          </Row>
          <Row label="Colours">
            {summary.variantCount}
            <span className="ml-2 text-xs text-neutral-500">{pluralize(summary.imageCount, "photo")}</span>
          </Row>
          <Row label="Sizes">
            {summary.sizeCount}
            <span className="ml-2 text-xs text-neutral-500">{SIZE_SETS[product.sizeSet]?.label || product.sizeSet}</span>
          </Row>
          <Row label="Saved">{saved ? timeAgo(baseline.updatedAt || baseline.createdAt) || "Saved" : "Not yet"}</Row>
        </dl>

        <div className="space-y-3 border-t border-neutral-800 p-5">
          <p className="flex items-center gap-2 text-xs text-neutral-400" aria-live="polite">
            <span className={`h-1.5 w-1.5 rounded-full ${dirty ? "bg-paper" : "bg-neutral-700"}`} aria-hidden="true" />
            {dirty ? "Unsaved changes" : saved ? "All changes saved" : "Nothing saved yet"}
          </p>
          {attempted && errorCount > 0 && <p className="text-xs text-red-500">{pluralize(errorCount, "field needs", "fields need")} attention.</p>}
          {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          <Button type="submit" variant="inverse" full loading={saving} className="hidden lg:inline-flex">
            {saved ? "Save changes" : "Create product"}
          </Button>
          {saved && (
            <Button variant="inverse-outline" full href={`/product/${baseline.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              View on store
            </Button>
          )}
          {saved && (
            <Button variant="inverse-outline" full onClick={duplicate} disabled={dirty || saving} title={dirty ? "Save your changes first" : "Create a copy of this product"}>
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Duplicate
            </Button>
          )}
        </div>

        {saved && (
          <div className="border-t border-neutral-800 px-5 py-3">
            <button type="button" onClick={onDelete} className="inline-flex h-10 items-center gap-2 text-xs text-neutral-500 transition-colors hover:text-paper">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Delete this product
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
