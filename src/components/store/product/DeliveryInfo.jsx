import React from "react";
import { Banknote, PackageCheck, RefreshCw, Truck } from "lucide-react";
import { formatINR } from "../../../lib/format";

export default function DeliveryInfo({ settings = {}, className = "" }) {
  const free = Number(settings.freeDeliveryOver) || 0;
  const fee = Number(settings.deliveryFee) || 0;
  const returnDays = Number(settings.returnDays) || 0;
  const rows = [
    settings.deliveryNote && { icon: Truck, text: settings.deliveryNote },
    { icon: PackageCheck, text: fee <= 0 ? "Free delivery on every order." : free > 0 ? `Free delivery from ${formatINR(free)}.` : `Delivery ${formatINR(fee)} per order.` },
    settings.codEnabled && { icon: Banknote, text: "Cash on delivery available." },
    returnDays > 0 && { icon: RefreshCw, text: `Easy exchange within ${returnDays} days.` },
  ].filter(Boolean);
  if (!rows.length) return null;
  return (
    <ul className={`divide-y divide-line border-y border-line ${className}`}>
      {rows.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-3 py-3 text-sm text-neutral-700">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink" strokeWidth={1.5} aria-hidden="true" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
