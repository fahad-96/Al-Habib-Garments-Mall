import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { supabase } from "../../lib/supabaseClient";
import { trackOrderRemote } from "../../lib/storeApi";
import { formatDateTime, normalizePhone } from "../../lib/format";
import { waLink } from "../../lib/whatsapp";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Reveal from "../../components/ui/Reveal";
import WhatsAppIcon from "../../components/ui/WhatsAppIcon";
import { Input } from "../../components/ui/Fields";
import OrderLines from "../../components/store/checkout/OrderLines";
import OrderTotals from "../../components/store/checkout/OrderTotals";
import StatusTimeline from "../../components/store/checkout/StatusTimeline";

function HelpButton({ settings, orderNumber = "", variant = "secondary", full = false }) {
  const text = orderNumber ? `Hi ${settings.storeName}, I'd like an update on order ${orderNumber}.` : `Hi ${settings.storeName}, I'd like help tracking my order.`;
  return (
    <Button href={waLink(settings.whatsappNumber, text)} target="_blank" rel="noreferrer" variant={variant} full={full}>
      <WhatsAppIcon className="h-4 w-4" color="#25D366" />
      Ask on WhatsApp
    </Button>
  );
}

function TrackResult({ order, settings }) {
  const lines = Array.isArray(order.items) ? order.items : [];
  return (
    <Reveal className="mt-12 border-t border-line pt-10">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="eyebrow">Order</p>
          <p className="mt-1 text-2xl font-medium tabular-nums tracking-[0.06em]">{order.order_number}</p>
          {order.created_at && <p className="mt-1 text-sm text-neutral-500">Placed {formatDateTime(order.created_at)}</p>}
        </div>
        {order.customer_name && (
          <p className="text-sm text-neutral-600">
            For <span className="font-medium text-ink">{order.customer_name}</span>
            {order.city ? `, ${order.city}` : ""}
          </p>
        )}
      </div>

      <section className="mt-10" aria-labelledby="track-status-heading">
        <h2 id="track-status-heading" className="eyebrow">
          Status
        </h2>
        <StatusTimeline status={order.status} history={order.status_history} className="mt-5" />
      </section>

      {lines.length > 0 && (
        <section className="mt-12" aria-labelledby="track-items-heading">
          <h2 id="track-items-heading" className="eyebrow">
            Items
          </h2>
          <OrderLines lines={lines} className="mt-4" />
        </section>
      )}

      <section className="mt-10" aria-labelledby="track-totals-heading">
        <h2 id="track-totals-heading" className="eyebrow">
          Totals
        </h2>
        <OrderTotals totals={order} className="mt-4" />
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <HelpButton settings={settings} orderNumber={order.order_number} />
        <Button variant="ghost" to="/shop">
          Continue shopping
        </Button>
      </div>
    </Reveal>
  );
}

export default function TrackOrderPage() {
  const { settings, customer, isSupabaseConfigured } = useShop();
  const [params] = useSearchParams();
  const [number, setNumber] = useState(() => params.get("order") || "");
  const [phone, setPhone] = useState(() => customer.phone || "");
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: "idle", order: null, message: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!number.trim()) next.number = "Enter the order number from your WhatsApp message.";
    if (!normalizePhone(phone)) next.phone = "Enter the 10-digit mobile number you ordered with.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setState({ status: "loading", order: null, message: "" });
    try {
      const order = await trackOrderRemote(supabase, number, phone);
      setState(order ? { status: "found", order, message: "" } : { status: "notfound", order: null, message: "" });
    } catch (error) {
      setState({ status: "error", order: null, message: String(error?.message || "") || "Could not look up the order. Please try again." });
    }
  };

  return (
    <div className="container max-w-2xl pb-20 pt-8 sm:pt-10 lg:pt-14">
      <Seo title="Track your order" description="Check the status of an order from Al Habib Garments Mall with your order number and phone." noindex />

      <Reveal as="header">
        <p className="eyebrow">Orders</p>
        <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">Track your order</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">Enter the order number from your WhatsApp message and the phone you ordered with.</p>
      </Reveal>

      {!isSupabaseConfigured ? (
        <div className="mt-10 border border-line p-6 sm:p-8">
          <p className="text-sm font-medium">Online tracking opens once the store is connected.</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">Until then, message us on WhatsApp with your order details and we will tell you exactly where it is.</p>
          <div className="mt-6">
            <HelpButton settings={settings} orderNumber={number.trim()} variant="primary" />
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} noValidate className="mt-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Order number"
                name="order"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value.toUpperCase());
                  setErrors((p) => ({ ...p, number: undefined }));
                }}
                placeholder="AHG-01001"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={20}
                error={errors.number}
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((p) => ({ ...p, phone: undefined }));
                }}
                placeholder="10-digit mobile"
                maxLength={16}
                error={errors.phone}
              />
            </div>
            <Button type="submit" loading={state.status === "loading"} className="mt-5 w-full sm:w-auto sm:min-w-[12rem]">
              Track order
            </Button>
          </form>

          {state.status === "found" && <TrackResult order={state.order} settings={settings} />}

          {state.status === "notfound" && (
            <div className="mt-10 border-t border-line">
              <EmptyState
                icon={PackageSearch}
                title="We could not find that order"
                description="Check the order number and the phone you used. If it still does not turn up, we will find it for you on WhatsApp."
                action={<HelpButton settings={settings} orderNumber={number.trim()} />}
              />
            </div>
          )}

          {state.status === "error" && (
            <div className="mt-8 border border-ink p-4" role="alert">
              <p className="text-sm font-medium">Could not look up the order right now.</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">{state.message}</p>
              <div className="mt-4">
                <HelpButton settings={settings} orderNumber={number.trim()} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
