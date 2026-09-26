import React from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import Img from "../../ui/Img";
import Spinner from "../../ui/Spinner";
import StatusPill from "../StatusPill";
import { getDiscount, isLowStock, productImage, productTotalStock } from "../../../lib/catalogUtils";
import { formatINR, pluralize } from "../../../lib/format";

// Phone-width alternative to the DataTable: one tappable row per product, nothing hidden off-screen.
export default function MobileProductList({ rows, loading = false, selected, onToggle, onToggleAll, categoryName, className = "" }) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  return (
    <div className={`admin-card ${className}`}>
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
        <input type="checkbox" checked={allSelected} onChange={(e) => onToggleAll?.(e.target.checked)} aria-label="Select all" className="h-4 w-4 accent-white" />
        <span className="text-2xs font-medium uppercase tracking-micro text-neutral-500">{allSelected ? "All selected" : "Select all"}</span>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <ul className="divide-y divide-neutral-800">
          {rows.map((p) => {
            const src = productImage(p);
            const total = productTotalStock(p);
            const off = getDiscount(p);
            const stock = total === 0 ? "Sold out" : isLowStock(p) ? `${total} left · Low` : `${total} in stock`;
            return (
              <li key={p.id} className={`flex items-center gap-3 px-4 py-3 ${selected.has(p.id) ? "bg-neutral-900/60" : ""}`}>
                <input type="checkbox" checked={selected.has(p.id)} onChange={() => onToggle?.(p.id)} aria-label={`Select ${p.title}`} className="h-4 w-4 shrink-0 accent-white" />
                <Link to={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-16 w-12 shrink-0 overflow-hidden bg-neutral-900">
                    {src ? (
                      <Img src={src} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-600" aria-hidden="true">
                        <ImageOff className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-paper">{p.title || "Untitled product"}</p>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {categoryName(p.categoryKey) || p.slug}
                      {p.badge ? ` · ${p.badge}` : ""}
                    </p>
                    <p className={`mt-1 text-xs ${total === 0 ? "text-neutral-500" : "text-neutral-300"}`}>
                      {stock} · {pluralize((p.variants || []).length, "colour")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm tabular-nums text-paper">{formatINR(p.price)}</p>
                    {off > 0 && <p className="text-xs tabular-nums text-neutral-500 line-through">{formatINR(p.mrp)}</p>}
                    <StatusPill tone={p.isActive ? "solid" : "muted"} className="mt-1.5">
                      {p.isActive ? "Active" : "Hidden"}
                    </StatusPill>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
