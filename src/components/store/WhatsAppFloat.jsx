import React from "react";
import { useLocation } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { waLink } from "../../lib/whatsapp";
import WhatsAppIcon from "../ui/WhatsAppIcon";

// Floating WhatsApp button. Product and bag pages carry their own WhatsApp actions
// and a sticky bottom bar on phones, so the float only shows there from lg up.
export default function WhatsAppFloat() {
  const { settings } = useShop();
  const { pathname } = useLocation();
  const hasOwnCta = pathname.startsWith("/product/") || pathname === "/bag" || pathname === "/order/placed";
  return (
    <a
      href={waLink(settings.whatsappNumber, `Hi ${settings.storeName}, I'd like some help with an order.`)}
      target="_blank"
      rel="noreferrer"
      className={`fixed bottom-5 right-4 z-40 h-12 w-12 items-center justify-center rounded-full border border-paper/30 bg-ink text-paper shadow-pop transition-transform hover:scale-105 sm:bottom-6 sm:right-6 ${hasOwnCta ? "hidden lg:flex" : "flex"}`}
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6" color="#25D366" />
    </a>
  );
}
