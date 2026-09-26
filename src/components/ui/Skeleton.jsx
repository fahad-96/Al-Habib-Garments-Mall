import React from "react";

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton className="mt-3 h-3 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container py-10">
      <Skeleton className="h-8 w-56" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
