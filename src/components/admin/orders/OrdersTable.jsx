import React from "react";
import { Link } from "react-router-dom";
import DataTable from "../DataTable";
import StatusPill from "../StatusPill";
import Spinner from "../../ui/Spinner";
import { formatDateTime, formatINR, pluralize, timeAgo } from "../../../lib/format";
import { formatPhone, itemCount } from "./orderUtils";

const stop = (e) => e.stopPropagation();

const COLUMNS = [
  {
    key: "orderNumber",
    label: "Order",
    render: (o) => (
      <Link to={`/admin/orders/${o.id}`} onClick={stop} className="font-medium tabular-nums text-paper hover:underline underline-offset-4">
        {o.orderNumber || "Order"}
      </Link>
    ),
  },
  {
    key: "createdAt",
    label: "Placed",
    hideBelow: "md",
    render: (o) => <span className="whitespace-nowrap tabular-nums text-neutral-400">{formatDateTime(o.createdAt)}</span>,
  },
  {
    key: "customer",
    label: "Customer",
    render: (o) => (
      <div className="min-w-0 max-w-[16rem]">
        <p className="truncate text-neutral-100">{o.customer?.name || "Customer"}</p>
        <p className="truncate text-xs tabular-nums text-neutral-500">{[formatPhone(o.customer?.phone), o.customer?.city].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  { key: "items", label: "Items", hideBelow: "sm", className: "text-right", render: (o) => <span className="tabular-nums text-neutral-300">{itemCount(o)}</span> },
  { key: "total", label: "Total", className: "text-right", render: (o) => <span className="font-medium tabular-nums text-paper">{formatINR(o.total)}</span> },
  { key: "status", label: "Status", render: (o) => <StatusPill status={o.status} /> },
  {
    key: "updatedAt",
    label: "Updated",
    hideBelow: "lg",
    className: "text-right",
    render: (o) => <span className="whitespace-nowrap text-neutral-500">{timeAgo(o.updatedAt || o.createdAt)}</span>,
  },
];

function MobileList({ rows, loading, empty }) {
  if (loading) {
    return (
      <div className="admin-card">
        <Spinner label="Loading orders" />
      </div>
    );
  }
  if (rows.length === 0) return <p className="admin-card px-4 py-12 text-center text-sm text-neutral-500">{empty}</p>;
  return (
    <ul className="admin-card divide-y divide-neutral-800">
      {rows.map((o) => (
        <li key={o.id}>
          <Link to={`/admin/orders/${o.id}`} className="block px-4 py-3.5 transition-colors hover:bg-neutral-900">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium tabular-nums text-paper">{o.orderNumber || "Order"}</span>
              <span className="shrink-0 text-sm font-medium tabular-nums text-paper">{formatINR(o.total)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="truncate text-sm text-neutral-200">{o.customer?.name || "Customer"}</p>
              <StatusPill status={o.status} className="shrink-0" />
            </div>
            <p className="mt-1 truncate text-xs text-neutral-500">{[pluralize(itemCount(o), "item"), o.customer?.city, timeAgo(o.createdAt)].filter(Boolean).join(" · ")}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Card list on phones, the shared DataTable from `sm` up. Errors are shown by the page.
export default function OrdersTable({ rows, loading = false, empty = "Nothing here yet.", onOpen }) {
  return (
    <>
      <div className="sm:hidden">
        <MobileList rows={rows} loading={loading} empty={empty} />
      </div>
      <div className="hidden sm:block">
        <DataTable columns={COLUMNS} rows={rows} loading={loading} empty={empty} onRowClick={(o) => onOpen?.(o)} />
      </div>
    </>
  );
}
