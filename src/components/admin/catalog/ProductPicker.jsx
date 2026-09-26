import React, { useId, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { productImage } from "../../../lib/catalogUtils";
import { formatINR, pluralize } from "../../../lib/format";
import { ArtThumb, IconButton } from "./bits";

const norm = (s) => String(s || "").toLowerCase().trim();
const RESULT_LIMIT = 8;

function ResultRow({ product, categoryName, added, onToggle }) {
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <ArtThumb src={productImage(product)} className="h-10 w-[30px]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-paper">{product.title}</p>
        <p className="truncate text-xs text-neutral-500">
          {categoryName || product.department}
          <span className="mx-1.5">·</span>
          <span className="tabular-nums">{formatINR(product.price)}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={added}
        aria-label={`${added ? "Remove" : "Add"} ${product.title}`}
        className={`inline-flex h-10 shrink-0 items-center gap-1.5 border px-3 text-2xs font-medium uppercase tracking-micro transition-colors ${added ? "border-paper bg-paper text-ink" : "border-neutral-600 text-neutral-200 hover:border-paper hover:text-paper"}`}
      >
        {added && <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />}
        {added ? "Added" : "Add"}
      </button>
    </li>
  );
}

function SelectedRow({ index, total, slug, product, onUp, onDown, onRemove }) {
  const title = product?.title || slug;
  return (
    <li className={`flex items-center gap-2 py-1.5 pl-2 pr-1 sm:gap-3 sm:pl-3 ${product ? "" : "opacity-70"}`}>
      <span className="w-5 shrink-0 text-right text-2xs tabular-nums text-neutral-500" aria-hidden="true">
        {index + 1}
      </span>
      <ArtThumb src={product ? productImage(product) : ""} className="h-10 w-[30px]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-paper">{title}</p>
        <p className="truncate text-xs text-neutral-500">{product ? <span className="tabular-nums">{formatINR(product.price)}</span> : "Not on the store right now"}</p>
      </div>
      <div className="flex shrink-0 items-center">
        <IconButton icon={ChevronUp} label={`Move ${title} up`} onClick={onUp} disabled={index === 0} size="h-10 w-9" />
        <IconButton icon={ChevronDown} label={`Move ${title} down`} onClick={onDown} disabled={index === total - 1} size="h-10 w-9" />
        <IconButton icon={X} label={`Remove ${title}`} onClick={onRemove} size="h-10 w-9" />
      </div>
    </li>
  );
}

// Search the catalog, add products with a toggle and keep the chosen ones in display order.
// `value` is the ordered list of product slugs.
export default function ProductPicker({ value = [], onChange, products = [], categories = [] }) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const q = norm(query);

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const categoryName = (key) => categories.find((c) => c.key === key)?.name || "";
  const selected = useMemo(() => new Set(value), [value]);

  const results = useMemo(() => {
    if (!q) return [];
    const starts = [];
    const rest = [];
    for (const p of products) {
      const title = norm(p.title);
      if (title.startsWith(q) || p.slug.startsWith(q)) starts.push(p);
      else if (title.includes(q) || p.slug.includes(q)) rest.push(p);
      if (starts.length >= RESULT_LIMIT) break;
    }
    return [...starts, ...rest].slice(0, RESULT_LIMIT);
  }, [products, q]);

  const toggle = (slug) => onChange(selected.has(slug) ? value.filter((s) => s !== slug) : [...value, slug]);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const removeAt = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      <label htmlFor={searchId} className="label label-dark">
        Add products
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
        <input id={searchId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${products.length ? pluralize(products.length, "product") : "products"} by title or slug`} autoComplete="off" className="field field-dark pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden" />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-neutral-400 hover:text-paper" aria-label="Clear search">
            <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
      </div>
      {q && (
        <ul className="mt-2 divide-y divide-neutral-800 border border-neutral-800" aria-label="Search results" aria-live="polite">
          {results.length ? (
            results.map((p) => <ResultRow key={p.slug} product={p} categoryName={categoryName(p.categoryKey)} added={selected.has(p.slug)} onToggle={() => toggle(p.slug)} />)
          ) : (
            <li className="px-3 py-4 text-xs text-neutral-500">Nothing matches “{query.trim()}”.</li>
          )}
        </ul>
      )}

      <div className="mt-6 flex items-baseline justify-between gap-3">
        <p className="label label-dark mb-0">In this collection</p>
        <p className="text-xs tabular-nums text-neutral-500">{pluralize(value.length, "product")}</p>
      </div>
      {value.length ? (
        <ol className="mt-2 divide-y divide-neutral-800 border border-neutral-800">
          {value.map((slug, i) => (
            <SelectedRow key={slug} index={i} total={value.length} slug={slug} product={bySlug.get(slug) || null} onUp={() => move(i, -1)} onDown={() => move(i, 1)} onRemove={() => removeAt(i)} />
          ))}
        </ol>
      ) : (
        <div className="mt-2 border border-dashed border-neutral-800 px-4 py-8 text-center text-xs leading-5 text-neutral-500">Nothing here yet. Search above and add products in the order you want them shown.</div>
      )}
    </div>
  );
}
