import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import StatusPill from "../StatusPill";
import { formatINR } from "../../../lib/format";
import { COUPON_STATUS, couponStatus, describeDiscount, describeUsage, describeValidity } from "./couponUtils";

const Dash = () => <span className="text-neutral-600">—</span>;

export function CouponStatusPill({ coupon, className = "" }) {
  const s = COUPON_STATUS[couponStatus(coupon)];
  return (
    <StatusPill tone={s.tone} className={className}>
      {s.label}
    </StatusPill>
  );
}

// Round icon buttons for the last column. Clicks must not open the row.
export function RowActions({ onEdit, onDelete, label }) {
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn?.();
  };
  const cls = "flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-paper";
  return (
    <div className="-my-1 flex items-center justify-end">
      <button type="button" onClick={stop(onEdit)} className={cls} aria-label={`Edit ${label}`}>
        <Pencil className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </button>
      <button type="button" onClick={stop(onDelete)} className={cls} aria-label={`Delete ${label}`}>
        <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}

// Column definitions for the coupons DataTable (sm and up).
export const couponColumns = ({ onEdit, onDelete }) => [
  {
    key: "code",
    label: "Code",
    className: "whitespace-nowrap",
    render: (c) => <span className="font-mono text-[13px] font-medium uppercase tracking-wide text-paper">{c.code}</span>,
  },
  {
    key: "discount",
    label: "Discount",
    className: "whitespace-nowrap",
    render: (c) => (
      <div>
        <p className="tabular-nums text-paper">{describeDiscount(c)}</p>
        {c.type === "percent" && c.maxDiscount != null && <p className="mt-0.5 text-xs tabular-nums text-neutral-500">up to {formatINR(c.maxDiscount)}</p>}
      </div>
    ),
  },
  {
    key: "minOrder",
    label: "Min order",
    hideBelow: "md",
    className: "whitespace-nowrap",
    render: (c) => (c.minOrder > 0 ? <span className="tabular-nums text-neutral-300">{formatINR(c.minOrder)}</span> : <Dash />),
  },
  {
    key: "validity",
    label: "Valid",
    hideBelow: "lg",
    className: "whitespace-nowrap",
    render: (c) => <span className="text-neutral-300">{describeValidity(c)}</span>,
  },
  {
    key: "usage",
    label: "Used",
    hideBelow: "md",
    className: "whitespace-nowrap text-right",
    render: (c) => <span className="tabular-nums text-neutral-300">{describeUsage(c)}</span>,
  },
  { key: "status", label: "Status", className: "whitespace-nowrap", render: (c) => <CouponStatusPill coupon={c} /> },
  { key: "actions", label: "", className: "w-24 !pl-0", render: (c) => <RowActions label={c.code} onEdit={() => onEdit(c)} onDelete={() => onDelete(c)} /> },
];
