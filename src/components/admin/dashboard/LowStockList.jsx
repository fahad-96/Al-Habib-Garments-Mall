import React from "react";
import { Link } from "react-router-dom";
import DashboardCard, { CardEmpty } from "./DashboardCard";
import { pluralize } from "../../../lib/format";

export default function LowStockList({ items = [], total = 0, soldOut = 0 }) {
  const meta = total > items.length ? `${items.length} of ${total}` : "";
  return (
    <DashboardCard title="Low stock" meta={meta} to="/admin/products" linkLabel="All products">
      {items.length === 0 ? (
        <CardEmpty>Every size is comfortably stocked.</CardEmpty>
      ) : (
        <ul className="divide-y divide-neutral-800">
          {items.map((item) => (
            <li key={`${item.productId}-${item.color}-${item.size}`}>
              <Link to={`/admin/products/${item.productId}`} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-neutral-900">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-paper">{item.title}</p>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {item.color} · {item.size}
                  </p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-neutral-300">{item.stock} left</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {soldOut > 0 && (
        <p className="mt-auto border-t border-neutral-800 px-5 py-3 text-xs text-neutral-500">
          {pluralize(soldOut, "size is", "sizes are")} sold out across the catalog.
        </p>
      )}
    </DashboardCard>
  );
}
