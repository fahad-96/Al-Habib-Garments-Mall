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

export default function ValueProps({ settings = {} }) {
  const freeOver = Number(settings.freeDeliveryOver) || 0;
  const returnDays = Number(settings.returnDays) || 0;
  const items = [
    { icon: MessageCircle, title: "Order on WhatsApp", text: "Every order is confirmed personally, size and colour checked before it leaves the shop." },
    {
      icon: Truck,
      title: freeOver > 0 ? `Free delivery over ${formatINR(freeOver)}` : "Delivery across India",
      text: freeOver > 0 ? "Across Jammu & Kashmir in 2 to 4 days, the rest of India in 5 to 8." : "Dispatched within 24 hours, tracked all the way.",
    },
    {
      icon: RefreshCw,
      title: returnDays > 0 ? `Easy exchange within ${returnDays} days` : "Easy exchanges",
      text: "Wrong size or a change of heart, message us and we sort it out.",
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
