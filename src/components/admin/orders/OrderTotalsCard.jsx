import React from "react";
import OrderCard from "./OrderCard";
import { formatINR } from "../../../lib/format";

function Row({ label, hint, children, muted = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className={muted ? "text-neutral-500" : "text-neutral-400"}>
        {label}
        {hint && <span className="ml-2 text-2xs font-medium uppercase tracking-micro text-neutral-500">{hint}</span>}
      </dt>
      <dd className="tabular-nums text-neutral-200">{children}</dd>
    </div>
  );
}

export default function OrderTotalsCard({ order }) {
  const subtotal = Number(order?.subtotal) || 0;
  const discount = Number(order?.discount) || 0;
  const deliveryFee = Number(order?.deliveryFee) || 0;
  const total = Number(order?.total) || 0;
  const showDiscount = discount > 0 || Boolean(order?.couponCode);
  return (
    <OrderCard title="Totals">
      <dl className="space-y-3">
        <Row label="Subtotal">{formatINR(subtotal)}</Row>
        {showDiscount && (
          <Row label="Discount" hint={order.couponCode ? `Coupon ${order.couponCode}` : ""}>
            {discount > 0 ? `−${formatINR(discount)}` : formatINR(0)}
          </Row>
        )}
        <Row label="Delivery" muted={deliveryFee === 0}>{deliveryFee > 0 ? formatINR(deliveryFee) : "Free"}</Row>
        <div className="flex items-baseline justify-between gap-4 border-t border-neutral-800 pt-4">
          <dt className="text-sm font-medium text-paper">Total</dt>
          <dd className="font-display text-2xl leading-none tabular-nums text-paper">{formatINR(total)}</dd>
        </div>
      </dl>
    </OrderCard>
  );
}
