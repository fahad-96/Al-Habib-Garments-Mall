import React from "react";
import { Textarea, Toggle } from "../../ui/Fields";
import { formatINR } from "../../../lib/format";
import NumberField from "./NumberField";
import SettingsSection from "./SettingsSection";
import { SECTIONS } from "./settingsUtils";

const meta = SECTIONS.find((s) => s.id === "delivery");

const deliveryLine = (fee, over) => {
  const f = Number(fee) || 0;
  const o = Number(over) || 0;
  if (f <= 0) return "Delivery is free on every order.";
  if (o <= 0) return `Every order is charged ${formatINR(f)} for delivery.`;
  return `Orders under ${formatINR(o)} pay ${formatINR(f)} for delivery. Over that, delivery is free.`;
};

export default function DeliverySection({ form, errors, patch }) {
  const days = Number(form.returnDays) || 0;
  return (
    <SettingsSection id={meta.id} title={meta.title} description={meta.description}>
      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField name="deliveryFee" label="Delivery fee" value={form.deliveryFee} onChange={(deliveryFee) => patch({ deliveryFee })} prefix="₹" placeholder="0" error={errors.deliveryFee} />
        <NumberField name="freeDeliveryOver" label="Free delivery over" value={form.freeDeliveryOver} onChange={(freeDeliveryOver) => patch({ freeDeliveryOver })} prefix="₹" placeholder="0" error={errors.freeDeliveryOver} hint="0 means delivery is never free." />
      </div>
      <p className="mt-3 text-xs text-neutral-400" aria-live="polite">
        {deliveryLine(form.deliveryFee, form.freeDeliveryOver)}
      </p>

      <div className="mt-6 border border-neutral-800 px-4 py-3.5">
        <Toggle dark checked={form.codEnabled} onChange={(codEnabled) => patch({ codEnabled })} label="Cash on delivery" description={form.codEnabled ? "Customers can pay when the parcel arrives." : "Payment is settled on WhatsApp before dispatch."} />
      </div>

      <Textarea dark name="deliveryNote" className="mt-5" label="Delivery note" rows={2} value={form.deliveryNote} onChange={(e) => patch({ deliveryNote: e.target.value })} placeholder="Dispatched within 24 hours. 2 to 4 days across Jammu & Kashmir." hint="Shown on product pages and in the bag." />

      <NumberField
        name="returnDays"
        className="mt-5 sm:max-w-xs"
        label="Return window"
        value={form.returnDays}
        onChange={(returnDays) => patch({ returnDays })}
        suffix="days"
        placeholder="7"
        error={errors.returnDays}
        hint={days > 0 ? `Customers can ask for an exchange or return within ${days} ${days === 1 ? "day" : "days"} of delivery.` : "0 switches the returns promise off across the site."}
      />
    </SettingsSection>
  );
}
