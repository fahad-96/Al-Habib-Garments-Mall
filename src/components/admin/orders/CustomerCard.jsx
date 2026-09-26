import React, { useEffect, useRef, useState } from "react";
import { Check, Copy, Phone } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import { waLink } from "../../../lib/whatsapp";
import Button from "../../ui/Button";
import WhatsAppIcon from "../../ui/WhatsAppIcon";
import OrderCard from "./OrderCard";
import { addressLines, addressText, formatPhone, hasPhone, telHref, waNumber, whatsappGreeting } from "./orderUtils";

export default function CustomerCard({ order, storeName }) {
  const { toast } = useShop();
  const customer = order?.customer || {};
  const canMessage = hasPhone(customer.phone);
  const lines = addressLines(customer);
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(addressText(order));
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("Could not copy. Select the address and copy it by hand.", { type: "error" });
    }
  };

  return (
    <OrderCard title="Customer">
      <p className="text-base font-medium leading-snug text-paper">{customer.name || "Customer"}</p>
      {canMessage ? (
        <a href={telHref(customer.phone)} className="mt-1 inline-flex min-h-[2.5rem] items-center gap-2 text-sm tabular-nums text-neutral-300 transition-colors hover:text-paper">
          <Phone className="h-3.5 w-3.5 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
          {formatPhone(customer.phone)}
        </a>
      ) : (
        <p className="mt-1 text-sm text-neutral-500">{customer.phone ? `Phone: ${customer.phone}` : "No phone number on this order."}</p>
      )}

      {canMessage && (
        <Button variant="inverse-outline" size="sm" href={waLink(waNumber(customer.phone), whatsappGreeting(order, storeName))} target="_blank" rel="noreferrer" className="mt-3" full>
          <WhatsAppIcon className="h-4 w-4" color="#25D366" />
          Message on WhatsApp
        </Button>
      )}

      <div className="mt-5 border-t border-neutral-800 pt-4">
        <div className="flex items-center justify-between gap-4">
          <p className="label label-dark mb-0">Delivery address</p>
          <button
            type="button"
            onClick={copy}
            className="-mr-2 inline-flex h-10 items-center gap-1.5 px-2 text-2xs font-medium uppercase tracking-micro text-neutral-400 transition-colors hover:text-paper"
            aria-live="polite"
          >
            {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        {lines.length > 0 ? (
          <address className="mt-1 text-sm not-italic leading-relaxed text-neutral-200">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        ) : (
          <p className="mt-1 text-sm text-neutral-500">No address given.</p>
        )}
      </div>

      {customer.note && (
        <div className="mt-5 border-t border-neutral-800 pt-4">
          <p className="label label-dark">Note from customer</p>
          <p className="text-sm leading-relaxed text-neutral-300">{customer.note}</p>
        </div>
      )}
    </OrderCard>
  );
}
