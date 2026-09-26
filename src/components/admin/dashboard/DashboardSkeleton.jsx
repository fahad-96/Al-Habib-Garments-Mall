import React from "react";

const Block = ({ className = "" }) => <div className={`animate-pulse bg-neutral-900 ${className}`} aria-hidden="true" />;

export default function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <div className="grid grid-cols-2 gap-px border border-neutral-800 bg-neutral-800 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-neutral-950 p-4 sm:p-5 lg:p-6">
            <Block className="h-2.5 w-20" />
            <Block className="mt-4 h-8 w-16" />
            <Block className="mt-3 h-2.5 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        {[5, 4].map((rows, i) => (
          <div key={i} className="admin-card">
            <div className="border-b border-neutral-800 px-5 py-4">
              <Block className="h-4 w-28" />
            </div>
            <div className="divide-y divide-neutral-800">
              {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <Block className="h-3 w-24" />
                    <Block className="mt-2 h-2.5 w-32" />
                  </div>
                  <Block className="h-3 w-14" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
