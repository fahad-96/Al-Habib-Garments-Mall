import React from "react";
import { MapPin, MessageCircle, RefreshCw, Truck } from "lucide-react";
import { formatINR } from "../../../lib/format";
import Reveal from "../../ui/Reveal";

const shortAddress = (address) =>
  String(address || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");

const GIVES_DAYS = /\d+\s*(?:(?:to|-|–|—)\s*\d+\s*)?(?:working\s+|business\s+)?days?\b/i;

// The delivery-time part of the shop's delivery note ("Dispatched within 24 hours. 2 to 4 days across
// Jammu & Kashmir, 5 to 8 days across India." gives the second sentence), so the home page always says
// what the product page and the policies say. A note without day counts is used whole.
const deliveryTimes = (note) => {
  const sentences = (String(note || "").match(/[^.]+(?:\.|$)/g) || []).map((s) => s.trim()).filter(Boolean);
  const timed = sentences.filter((s) => GIVES_DAYS.test(s) && !/dispatch/i.test(s));
  const text = (timed.length ? timed : sentences).join(" ");
  return text && !/[.!?]$/.test(text) ? `${text}.` : text;
};

export default function ValueProps({ settings = {} }) {
  const fee = Number(settings.deliveryFee) || 0;
  const freeOver = Number(settings.freeDeliveryOver) || 0;
  const returnDays = Number(settings.returnDays) || 0;
  const deliveryTitle = fee <= 0 ? "Free delivery on every order" : freeOver > 0 ? `Free delivery from\u00a0${formatINR(freeOver)}` : "Delivery across India";
  const items = [
    { icon: MessageCircle, title: "Order on WhatsApp", text: "Every order is confirmed personally, size and colour checked before it leaves the shop." },
    { icon: Truck, title: deliveryTitle, text: deliveryTimes(settings.deliveryNote) || "Packed in Kunzer and sent with a tracking number on WhatsApp." },
    {
      icon: RefreshCw,
      title: returnDays > 0 ? `Easy exchange within ${returnDays} days` : "Easy exchanges",
      text: "Wrong size or a change of heart? Message us and we will sort it out.",
    },
    { icon: MapPin, title: "Visit us in Kunzer", text: shortAddress(settings.address) || "On the main market road, Tangmarg." },
  ];

  return (
    <section className="container mt-20 lg:mt-28" aria-label="Why shop with us">
      <Reveal>
        <ul className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <li key={title} className="bg-paper p-5 sm:p-6 lg:p-8">
              <Icon className="h-5 w-5" strokeWidth={1.25} aria-hidden="true" />
              <p className="mt-4 text-sm font-medium leading-snug">{title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{text}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
