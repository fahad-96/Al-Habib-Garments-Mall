import React from "react";

const Block = ({ className = "" }) => <div className={`animate-pulse bg-neutral-900 ${className}`} aria-hidden="true" />;

function CardSkeleton({ rows = 3, tall = false }) {
  return (
    <div className="admin-card">
      <div className="border-b border-neutral-800 px-5 py-4">
        <Block className="h-4 w-24" />
      </div>
      <div className="space-y-4 px-5 py-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            {tall && <Block className="aspect-[3/4] w-14 shrink-0" />}
            <div className="flex-1">
              <Block className="h-3 w-2/3" />
              <Block className="mt-2 h-2.5 w-1/3" />
            </div>
            <Block className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start" role="status" aria-label="Loading order">
      <div className="space-y-6">
        <CardSkeleton rows={3} tall />
        <CardSkeleton rows={4} />
      </div>
      <div className="space-y-6">
        <CardSkeleton rows={3} />
        <CardSkeleton rows={5} />
      </div>
    </div>
  );
}
