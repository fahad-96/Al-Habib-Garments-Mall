import React from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import Img from "../../ui/Img";
import StatusPill from "../StatusPill";
import { getDiscount, isLowStock, productImage, productTotalStock } from "../../../lib/catalogUtils";
import { formatINR, timeAgo } from "../../../lib/format";

function Thumb({ product }) {
  const src = productImage(product);
  return (
    <div className="h-16 w-12 shrink-0 overflow-hidden bg-neutral-900">
      {src ? (
        <Img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-neutral-600" aria-hidden="true">
          <ImageOff className="h-4 w-4" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

const Dash = () => <span className="text-neutral-600">—</span>;

// Column definitions for the products DataTable (sm and up). `categoryName(key)` resolves a category label.
// The badge rides along in the title cell so the table fits a 1440 admin viewport without scrolling.
export const productColumns = (categoryName) => [
  { key: "image", label: "", className: "w-14 !pr-0", render: (p) => <Thumb product={p} /> },
  {
    key: "title",
    label: "Product",
    className: "min-w-[200px]",
    // max-w caps the cell's intrinsic width (the slug line is nowrap) so the table fits a 1440 viewport.
    render: (p) => (
      <div className="min-w-0 max-w-[15rem]">
        <Link to={`/admin/products/${p.id}`} onClick={(e) => e.stopPropagation()} className="line-clamp-1 font-medium text-paper hover:underline hover:underline-offset-4">
          {p.title || "Untitled product"}
        </Link>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {p.badge && <span className="mr-2 text-2xs font-medium uppercase tracking-micro text-neutral-400">{p.badge}</span>}
          {p.slug}
        </p>
      </div>
    ),
  },
  { key: "category", label: "Category", hideBelow: "md", className: "whitespace-nowrap", render: (p) => <span className="text-neutral-300">{categoryName(p.categoryKey) || <Dash />}</span> },
  {
    key: "price",
    label: "Price",
    className: "whitespace-nowrap",
    render: (p) => {
      const off = getDiscount(p);
      return (
        <div>
          <p className="tabular-nums text-paper">{formatINR(p.price)}</p>
          {off > 0 && (
            <p className="mt-0.5 text-xs text-neutral-500">
              <span className="tabular-nums line-through">{formatINR(p.mrp)}</span>
              <span className="ml-1.5">{off}% off</span>
            </p>
          )}
        </div>
      );
    },
  },
  {
    key: "stock",
    label: "Stock",
    hideBelow: "sm",
    className: "whitespace-nowrap",
    render: (p) => {
      const total = productTotalStock(p);
      const low = isLowStock(p);
      return (
        <div>
          <p className={`tabular-nums ${total === 0 ? "text-neutral-500" : "text-paper"}`}>{total.toLocaleString("en-IN")}</p>
          {total === 0 ? (
            <p className="mt-0.5 text-2xs font-medium uppercase tracking-micro text-neutral-500">Sold out</p>
          ) : low ? (
            <p className="mt-0.5 flex items-center gap-1.5 text-2xs font-medium uppercase tracking-micro text-paper">
              <span className="h-1.5 w-1.5 rounded-full bg-paper" aria-hidden="true" />
              Low
            </p>
          ) : null}
        </div>
      );
    },
  },
  {
    key: "colours",
    label: "Colours",
    hideBelow: "lg",
    className: "whitespace-nowrap",
    render: (p) => {
      const variants = p.variants || [];
      if (!variants.length) return <Dash />;
      return (
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-neutral-300">{variants.length}</span>
          <span className="flex items-center gap-1" aria-hidden="true">
            {variants.slice(0, 4).map((v, i) => (
              <span key={`${v.color}-${i}`} className="h-3 w-3 rounded-full border border-neutral-600" style={{ backgroundColor: v.hex }} title={v.color} />
            ))}
            {variants.length > 4 && <span className="text-2xs text-neutral-500">+{variants.length - 4}</span>}
          </span>
        </div>
      );
    },
  },
  { key: "status", label: "Status", className: "whitespace-nowrap", render: (p) => <StatusPill tone={p.isActive ? "solid" : "muted"}>{p.isActive ? "Active" : "Hidden"}</StatusPill> },
  { key: "updated", label: "Updated", hideBelow: "md", className: "whitespace-nowrap", render: (p) => <span className="text-neutral-500">{timeAgo(p.updatedAt || p.createdAt) || <Dash />}</span> },
];
