import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../../../context/ShopContext";
import Button from "../../ui/Button";
import { Input, Textarea } from "../../ui/Fields";
import WhatsAppIcon from "../../ui/WhatsAppIcon";
import { useCheckoutForm } from "./useCheckoutForm";

// Delivery details + the "Place order on WhatsApp" action.
// `submitRef` lets the page know when the real button is on screen.
export default function DeliveryForm({ formId = "checkout-form", submitRef, orderable = true, className = "" }) {
  const { customer, setCustomer, settings, placeOrder, placing, toast } = useShop();
  const navigate = useNavigate();
  const { bind, normalizePhoneField, validateAll } = useCheckoutForm(customer, setCustomer);
  const [error, setError] = useState("");
  const formRef = useRef(null);

  const paymentNote = settings.codEnabled ? "Cash on delivery, or pay by UPI when we confirm on WhatsApp." : "Pay by UPI when we confirm your order on WhatsApp.";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (placing || !orderable) return;
    setError("");
    const errors = validateAll();
    const first = Object.keys(errors).find((k) => errors[k]);
    if (first) {
      const el = formRef.current?.querySelector(`[name="${first}"]`);
      el?.scrollIntoView?.({ block: "center", behavior: "smooth" });
      el?.focus?.({ preventScroll: true });
      return;
    }
    const res = await placeOrder();
    if (res.ok) {
      navigate("/order/placed");
      return;
    }
    const message = res.error || "Could not place the order. Please try again.";
    setError(message);
    toast(message, { type: "error" });
  };

  return (
    <form id={formId} ref={formRef} onSubmit={onSubmit} noValidate className={className} aria-labelledby="delivery-heading">
      <h2 id="delivery-heading" className="font-display text-2xl leading-tight tracking-tight">
        Delivery details
      </h2>
      <p className="mt-1.5 text-sm text-neutral-500">We confirm the address with you on WhatsApp before dispatch.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Full name" autoComplete="name" placeholder="Your name" maxLength={80} {...bind("name")} />
        <Input label="Phone (WhatsApp)" type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" maxLength={16} {...bind("phone")} onBlur={normalizePhoneField} />
        <Textarea label="Address" rows={2} autoComplete="street-address" placeholder="House, street, landmark" maxLength={300} className="sm:col-span-2" {...bind("address")} />
        <Input label="City or village" autoComplete="address-level2" placeholder="Kunzer, Tangmarg" maxLength={80} {...bind("city")} />
        <Input label="PIN code" hint="Optional" inputMode="numeric" autoComplete="postal-code" placeholder="193402" maxLength={6} {...bind("pincode")} />
        <Input label="Note for us" hint="Optional" placeholder="A size doubt, a delivery time, anything we should know" maxLength={240} className="sm:col-span-2" {...bind("note")} />
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="eyebrow">Payment</p>
        <p className="mt-1.5 text-sm text-neutral-700">{paymentNote}</p>
      </div>

      {error && (
        <p className="mt-5 border border-ink px-4 py-3 text-sm" role="alert">
          {error}
        </p>
      )}
      {!orderable && <p className="mt-5 text-sm text-neutral-600">Nothing in your bag can be ordered right now. Remove the unavailable pieces or add new ones.</p>}

      <Button ref={submitRef} type="submit" size="lg" full loading={placing} disabled={!orderable} className="mt-6">
        {!placing && <WhatsAppIcon className="h-4 w-4" color="#25D366" />}
        Place order on WhatsApp
      </Button>
      <p className="mt-3 text-center text-xs leading-relaxed text-neutral-500">WhatsApp opens with your order ready to send. We confirm within the hour.</p>
    </form>
  );
}
