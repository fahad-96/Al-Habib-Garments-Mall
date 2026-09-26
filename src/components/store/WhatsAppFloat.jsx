import React from "react";
import { useShop } from "../../context/ShopContext";
import { waLink } from "../../lib/whatsapp";
import WhatsAppIcon from "../ui/WhatsAppIcon";

export default function WhatsAppFloat() {
  const { settings } = useShop();
  return (
    <a
      href={waLink(settings.whatsappNumber, `Hi ${settings.storeName}, I'd like some help with an order.`)}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-paper/30 bg-ink text-paper shadow-pop transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6" color="#25D366" />
    </a>
  );
}
