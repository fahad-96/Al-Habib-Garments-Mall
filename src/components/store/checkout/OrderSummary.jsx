import React from "react";
import { useShop } from "../../../context/ShopContext";
import { formatINR, pluralize } from "../../../lib/format";
import CouponField from "./CouponField";
import { TotalsGrand, TotalsRow } from "./OrderTotals";

function FreeDeliveryProgress({ totals, settings }) {
  const freeOver = Number(settings.freeDeliveryOver) || 0;
  if (freeOver <= 0) return null;
  const afterDiscount = Math.max(0, totals.subtotal - totals.discount);
  const remaining = Math.max(0, freeOver - afterDiscount);
  const pct = Math.min(100, Math.round((afterDiscount / freeOver) * 100));
  return (
    <div className="mt-4">
      <p className="text-xs text-neutral-600">
        {remaining > 0 ? (
          <>
            Add <span className="font-medium tabular-nums text-ink">{formatINR(remaining)}</span> more for free delivery
          </>
        ) : (
          "You qualify for free delivery"
        )}
      </p>
      {remaining > 0 && (
        <div className="mt-2 h-0.5 w-full bg-neutral-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progress to free delivery">
          <div className="h-0.5 bg-ink transition-[width] duration-500 ease-soft" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

// Bag totals card: coupon, MRP breakdown, delivery and the grand total.
export default function OrderSummary({ className = "" }) {
  const { totals, settings } = useShop();
  const saved = totals.savings + totals.discount;

  return (
    <section className={`border border-line p-5 sm:p-6 ${className}`} aria-labelledby="order-summary-heading">
      <h2 id="order-summary-heading" className="text-2xs font-medium uppercase tracking-micro">
        Order summary
      </h2>

      <CouponField className="mt-5" />

      <dl className="mt-6 space-y-3 border-t border-line pt-5">
        <TotalsRow label={`Item total (${pluralize(totals.itemCount, "item")})`} value={formatINR(totals.mrpTotal)} />
        {totals.savings > 0 && <TotalsRow label="Discount on MRP" value={`−${formatINR(totals.savings)}`} />}
        {totals.discount > 0 && <TotalsRow label="Coupon discount" value={`−${formatINR(totals.discount)}`} />}
        <TotalsRow label="Delivery" value={totals.deliveryFee > 0 ? formatINR(totals.deliveryFee) : "Free"} />
      </dl>

      <FreeDeliveryProgress totals={totals} settings={settings} />

      <dl className="mt-5">
        <TotalsGrand value={formatINR(totals.total)} />
      </dl>
      {saved > 0 && (
        <p className="mt-1.5 text-xs text-neutral-500">
          You save <span className="tabular-nums">{formatINR(saved)}</span> on this order
        </p>
      )}
    </section>
  );
}
