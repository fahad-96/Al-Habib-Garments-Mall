import React from "react";
import { Navigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { formatDateTime } from "../../lib/format";
import { buildOrderMessage, waLink } from "../../lib/whatsapp";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import Reveal from "../../components/ui/Reveal";
import WhatsAppIcon from "../../components/ui/WhatsAppIcon";
import OrderLines from "../../components/store/checkout/OrderLines";
import OrderTotals from "../../components/store/checkout/OrderTotals";
import NextSteps from "../../components/store/checkout/NextSteps";

function DeliveryAddress({ customer = {} }) {
  const cityLine = [customer.city, customer.pincode].filter(Boolean).join(" ");
  if (!customer.name && !customer.address && !cityLine) return null;
  return (
    <div>
      <p className="eyebrow">Delivering to</p>
      <address className="mt-2 text-sm not-italic leading-relaxed text-neutral-700">
        {customer.name && <span className="block font-medium text-ink">{customer.name}</span>}
        {customer.address && <span className="block">{customer.address}</span>}
        {cityLine && <span className="block">{cityLine}</span>}
        {customer.phone && <span className="block text-neutral-500">{customer.phone}</span>}
      </address>
      {customer.note && <p className="mt-2 text-xs leading-relaxed text-neutral-500">Note: {customer.note}</p>}
    </div>
  );
}

export default function OrderPlacedPage() {
  const { lastOrder, settings } = useShop();

  if (!lastOrder) return <Navigate to="/bag" replace />;

  const number = lastOrder.orderNumber || "";
  const lines = Array.isArray(lastOrder.lines) ? lastOrder.lines : [];
  const totals = lastOrder.totals || {};
  const customer = lastOrder.customer || {};
  const firstName = String(customer.name || "").trim().split(/\s+/)[0];
  const placedAt = formatDateTime(lastOrder.createdAt);

  const message = buildOrderMessage({
    storeName: settings.storeName,
    orderNumber: number || null,
    lines,
    totals,
    customer,
    siteUrl: typeof window !== "undefined" ? window.location.origin : "",
  });
  const whatsappHref = waLink(settings.whatsappNumber, message);

  return (
    <div className="container max-w-4xl pb-20 pt-10 sm:pt-14 lg:pt-20">
      <Seo title="Order sent on WhatsApp" description="Your order has been sent to Al Habib Garments Mall on WhatsApp." noindex />

      <Reveal className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-ink" aria-hidden="true">
          <Check className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <p className="eyebrow mt-7">{firstName ? `Thank you, ${firstName}` : "Thank you"}</p>
        <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">Order sent on WhatsApp</h1>

        {number ? (
          <div className="mt-8">
            <p className="eyebrow">Order number</p>
            <p className="mt-1.5 text-3xl font-medium tabular-nums tracking-[0.08em] sm:text-4xl">{number}</p>
          </div>
        ) : (
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-neutral-600">We did not get a number yet, your WhatsApp message carries the details.</p>
        )}
        {placedAt && <p className="mt-3 text-sm text-neutral-500">Placed {placedAt}</p>}

        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button href={whatsappHref} target="_blank" rel="noreferrer">
            <WhatsAppIcon className="h-4 w-4" color="#25D366" />
            Open WhatsApp again
          </Button>
          {number && (
            <Button variant="secondary" to={`/track?order=${encodeURIComponent(number)}`}>
              Track order
            </Button>
          )}
          <Button variant="ghost" to="/shop">
            Continue shopping
          </Button>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <NextSteps settings={settings} className="mt-16" />
      </Reveal>

      <Reveal delay={0.15} className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-x-16">
        <section className="lg:col-span-7" aria-labelledby="placed-items-heading">
          <h2 id="placed-items-heading" className="eyebrow">
            Your order
          </h2>
          <OrderLines lines={lines} className="mt-4" />
        </section>
        <aside className="space-y-10 lg:col-span-5">
          <section aria-labelledby="placed-totals-heading">
            <h2 id="placed-totals-heading" className="eyebrow">
              Totals
            </h2>
            <OrderTotals totals={totals} className="mt-4" />
          </section>
          <DeliveryAddress customer={customer} />
        </aside>
      </Reveal>
    </div>
  );
}
