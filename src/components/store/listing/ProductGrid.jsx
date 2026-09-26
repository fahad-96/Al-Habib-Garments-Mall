import React from "react";
import ProductCard from "../ProductCard";
import Button from "../../ui/Button";
import { ProductCardSkeleton } from "../../ui/Skeleton";

export const GRID_CLASS = "grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4 lg:gap-x-6";

export function ProductGridSkeleton({ count = 12 }) {
  return (
    <div className={GRID_CLASS} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ProductGrid({ products = [], total = products.length, hasMore = false, onLoadMore, eagerCount = 4 }) {
  const shown = products.length;
  const pct = total > 0 ? Math.min(100, Math.round((shown / total) * 100)) : 0;
  return (
    <>
      <div className={GRID_CLASS}>
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} eager={i < eagerCount} />
        ))}
      </div>
      {total > 0 && (
        <div className="mt-14 flex flex-col items-center gap-4 text-center">
          <p className="text-xs text-neutral-500">
            Showing <span className="font-medium tabular-nums text-ink">{shown}</span> of <span className="font-medium tabular-nums text-ink">{total}</span>
          </p>
          <div className="h-px w-40 bg-neutral-200" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={shown} aria-label="Products loaded">
            <div className="h-px bg-ink transition-[width] duration-500 ease-soft" style={{ width: `${pct}%` }} />
          </div>
          {hasMore && (
            <Button variant="secondary" onClick={onLoadMore} className="mt-2 min-w-[12rem]">
              Load more
            </Button>
          )}
        </div>
      )}
    </>
  );
}
