import React from "react";
import { createPortal } from "react-dom";
import { formatDateTime, formatINR } from "../../../lib/format";
import { addressLines, formatPhone, hasPhone, itemCount, statusLabel } from "./orderUtils";

// The slip lives outside #root so printing shows only it: the admin shell
// (sidebar, top bar, cards) is hidden wholesale. Pure black on white.
const PRINT_CSS = `
@media print {
  @page { margin: 14mm; }
  html, body { background: #fff !important; color: #000 !important; }
  #root, .admin-print-hide { display: none !important; }
  .packing-slip { display: block !important; }
}
`;

export default function PackingSlip({ order, storeName = "Al Habib Garments Mall", storeLine = "Kunzer, Tangmarg", storePhone = "" }) {
  if (typeof document === "undefined" || !order) return null;
  const items = Array.isArray(order.items) ? order.items : [];
  const customer = order.customer || {};
  const discount = Number(order.discount) || 0;
  const deliveryFee = Number(order.deliveryFee) || 0;

  return createPortal(
    <div className="packing-slip hidden text-[12px] leading-relaxed text-black" aria-hidden="true">
      <style>{PRINT_CSS}</style>
      <header className="flex items-end justify-between border-b border-black pb-3">
        <div>
          <p className="font-display text-2xl leading-none tracking-[0.04em]">{storeName}</p>
          <p className="mt-1.5 text-[9px] uppercase tracking-[0.28em]">{storeLine}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-[0.24em]">Packing slip</p>
          <p className="mt-1 text-lg font-semibold tabular-nums leading-none">{order.orderNumber}</p>
          <p className="mt-1 tabular-nums">{formatDateTime(order.createdAt)}</p>
        </div>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-8">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.2em]">Deliver to</p>
          <p className="mt-1.5 text-sm font-semibold">{customer.name || "Customer"}</p>
          {hasPhone(customer.phone) && <p className="tabular-nums">{formatPhone(customer.phone)}</p>}
          {addressLines(customer).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.2em]">Order</p>
          <p className="mt-1.5">Status: {statusLabel(order.status)}</p>
          <p>Items: {itemCount(order)}</p>
          {order.couponCode && <p>Coupon: {order.couponCode}</p>}
          {customer.note && <p className="mt-2 italic">Customer note: {customer.note}</p>}
        </div>
      </section>

      <table className="mt-6 w-full border-collapse">
        <thead>
          <tr className="border-b border-black text-left text-[9px] uppercase tracking-[0.18em]">
            <th className="py-1.5 pr-3 font-medium">Item</th>
            <th className="py-1.5 pr-3 font-medium">Colour / size</th>
            <th className="py-1.5 pr-3 text-right font-medium">Qty</th>
            <th className="py-1.5 pr-3 text-right font-medium">Price</th>
            <th className="py-1.5 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const qty = Number(item?.qty) || 0;
            const price = Number(item?.price) || 0;
            return (
              <tr key={`${item?.slug || i}-${item?.color || ""}-${item?.size || ""}`} className="border-b border-neutral-300 align-top">
                <td className="py-2 pr-3">{item?.title || "Item"}</td>
                <td className="py-2 pr-3">{[item?.color, item?.size].filter(Boolean).join(" / ") || "—"}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{qty}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{formatINR(price)}</td>
                <td className="py-2 text-right tabular-nums">{formatINR(qty * price)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <section className="mt-4 ml-auto w-64">
        <div className="flex justify-between py-0.5">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatINR(order.subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between py-0.5">
            <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
            <span className="tabular-nums">−{formatINR(discount)}</span>
          </div>
        )}
        <div className="flex justify-between py-0.5">
          <span>Delivery</span>
          <span className="tabular-nums">{deliveryFee > 0 ? formatINR(deliveryFee) : "Free"}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-black pt-1.5 text-sm font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatINR(order.total)}</span>
        </div>
      </section>

      <footer className="mt-8 border-t border-neutral-300 pt-3 text-[11px] text-black">
        Thank you for shopping with {storeName}.{storePhone ? ` Questions about this order? WhatsApp ${storePhone}.` : ""}
      </footer>
    </div>,
    document.body
  );
}
