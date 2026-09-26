import React from "react";
import { Link } from "react-router-dom";
import Accordion, { AccordionItem } from "../../ui/Accordion";
import { DETAIL_FIELDS } from "../../../data/catalog";
import { formatINR } from "../../../lib/format";

const KNOWN = new Set(DETAIL_FIELDS.map(([key]) => key));
const present = (v) => v != null && String(v).trim() !== "";
const humanize = (key) =>
  String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

// Known fields in their defined order, then anything else the admin added.
export const detailRows = (details = {}) => {
  const known = DETAIL_FIELDS.filter(([key]) => present(details[key])).map(([key, label]) => [label, String(details[key])]);
  const extra = Object.entries(details)
    .filter(([key, value]) => !KNOWN.has(key) && present(value))
    .map(([key, value]) => [humanize(key), String(value)]);
  return [...known, ...extra];
};

const paragraphs = (text) =>
  String(text || "")
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export default function DetailsAccordion({ product, settings = {} }) {
  const rows = detailRows(product.details);
  const paras = paragraphs(product.description);
  const free = Number(settings.freeDeliveryOver) || 0;
  const fee = Number(settings.deliveryFee) || 0;
  const returnDays = Number(settings.returnDays) || 0;

  const deliveryLine = free > 0 ? `Delivery is free on orders over ${formatINR(free)}${fee > 0 ? ` and ${formatINR(fee)} below that` : ""}.` : fee > 0 ? `Delivery is ${formatINR(fee)} per order.` : "Delivery is free.";

  return (
    <Accordion>
      <AccordionItem title="Product details" defaultOpen>
        {rows.length ? (
          <dl className="grid grid-cols-[minmax(5.5rem,7.5rem)_minmax(0,1fr)] gap-x-6 gap-y-2.5">
            {rows.map(([label, value]) => (
              <React.Fragment key={label}>
                <dt className="text-neutral-500">{label}</dt>
                <dd className="text-ink">{value}</dd>
              </React.Fragment>
            ))}
          </dl>
        ) : (
          <p>Details for this piece are on their way. Ask us on WhatsApp in the meantime.</p>
        )}
      </AccordionItem>
      <AccordionItem title="Description">
        {paras.length ? (
          paras.map((p, i) => (
            <p key={`${i}-${p.slice(0, 12)}`} className={i ? "mt-3" : ""}>
              {p}
            </p>
          ))
        ) : (
          <p>{product.shortInfo || "A description is on its way."}</p>
        )}
      </AccordionItem>
      <AccordionItem title={"Shipping & returns"}>
        {settings.deliveryNote && <p>{settings.deliveryNote}</p>}
        <p className={settings.deliveryNote ? "mt-3" : ""}>
          {deliveryLine}
          {settings.codEnabled ? " Cash on delivery is available." : ""}
        </p>
        <p className="mt-3">
          {returnDays > 0 ? `Exchange within ${returnDays} days if the fit is not right: unworn, with tags, and we sort it out on WhatsApp.` : "Message us on WhatsApp to arrange an exchange."}{" "}
          <Link to="/policies" className="underline underline-offset-4 hover:text-ink">
            Read the full policy
          </Link>
        </p>
      </AccordionItem>
    </Accordion>
  );
}
