import React from "react";
import Spinner from "../../ui/Spinner";
import { formatINR } from "../../../lib/format";
import { CouponStatusPill } from "./couponColumns";
import { describeDiscount, describeUsage, describeValidity } from "./couponUtils";
import { textButton } from "./ConfigCard";

// Phone-width alternative to the DataTable: one card per coupon, nothing hidden off-screen.
export default function MobileCouponList({ rows, loading = false, empty = "Nothing here yet.", onEdit, onDelete, className = "" }) {
  if (loading) {
    return (
      <div className={`admin-card ${className}`}>
        <Spinner label="Loading coupons" />
      </div>
    );
  }
  if (rows.length === 0) return <p className={`admin-card px-4 py-12 text-center text-sm text-neutral-500 ${className}`}>{empty}</p>;
  return (
    <ul className={`admin-card divide-y divide-neutral-800 ${className}`}>
      {rows.map((c) => (
        <li key={c.id} className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-sm font-medium uppercase tracking-wide text-paper">{c.code}</span>
            <CouponStatusPill coupon={c} className="shrink-0" />
          </div>
          <p className="mt-1.5 text-sm tabular-nums text-neutral-200">
            {describeDiscount(c)}
            {c.type === "percent" && c.maxDiscount != null && <span className="text-neutral-500"> · up to {formatINR(c.maxDiscount)}</span>}
            {c.minOrder > 0 && <span className="text-neutral-500"> · min {formatINR(c.minOrder)}</span>}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {describeValidity(c)} · used {describeUsage(c)}
          </p>
          <div className="mt-2 flex items-center gap-5">
            <button type="button" onClick={() => onEdit(c)} className={textButton}>
              Edit
            </button>
            <button type="button" onClick={() => onDelete(c)} className={textButton}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
