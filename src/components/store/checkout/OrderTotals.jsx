import React from "react";
import { formatINR } from "../../../lib/format";

const num = (v) => Number(v) || 0;

export function TotalsRow({ label, value, className = "" }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 text-sm ${className}`}>
      <dt className="text-neutral-600">{label}</dt>
      <dd className="tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export function TotalsGrand({ label = "Total", value, className = "" }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 border-t border-ink pt-4 text-base font-semibold ${className}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

// Totals block for a placed or tracked order. Accepts both the client shape
// (deliveryFee, couponCode) and the database shape (delivery_fee, coupon_code).
export default function OrderTotals({ totals = {}, className = "" }) {
  const subtotal = num(totals.subtotal);
  const discount = num(totals.discount);
  const fee = num(totals.deliveryFee ?? totals.delivery_fee);
  const total = num(totals.total);
  const coupon = totals.couponCode || totals.coupon_code || "";
  const saved = num(totals.savings) + discount;

  return (
    <dl className={`space-y-3 ${className}`}>
      <TotalsRow label="Subtotal" value={formatINR(subtotal)} />
      {discount > 0 && <TotalsRow label={coupon ? `Coupon ${coupon}` : "Discount"} value={`−${formatINR(discount)}`} />}
      <TotalsRow label="Delivery" value={fee > 0 ? formatINR(fee) : "Free"} />
      <TotalsGrand value={formatINR(total)} />
      {saved > 0 && <p className="text-xs text-neutral-500">You saved {formatINR(saved)} on this order.</p>}
    </dl>
  );
}
