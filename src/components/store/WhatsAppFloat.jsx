import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { waLink } from "../../lib/whatsapp";
import WhatsAppIcon from "../ui/WhatsAppIcon";

// Floating WhatsApp button. Product and bag pages lead with their own WhatsApp buttons, which reach
// the float's corner on wide screens, so it never shows there. The order page keeps it from lg up.
// It steps aside while the footer is on screen, so it never sits on the address, hours or phone number.
export default function WhatsAppFloat() {
  const { settings } = useShop();
  const { pathname } = useLocation();
  const footerInView = useFooterInView(pathname);
  const hasOwnCta = pathname.startsWith("/product/") || pathname === "/bag";
  const phoneHidden = pathname === "/order/placed";
  return (
    <a
      href={waLink(settings.whatsappNumber, `Hi ${settings.storeName}, I'd like some help with an order.`)}
      target="_blank"
      rel="noreferrer"
      className={`fixed bottom-5 right-4 z-40 h-12 w-12 items-center justify-center rounded-full border border-paper/30 bg-ink text-paper shadow-pop transition-[opacity,transform,visibility] duration-300 hover:scale-105 sm:bottom-6 sm:right-6 ${hasOwnCta ? "hidden" : phoneHidden ? "hidden lg:flex" : "flex"} ${
        footerInView ? "invisible translate-y-3 opacity-0" : "visible opacity-100"
      }`}
      aria-label="Chat on WhatsApp"
      aria-hidden={footerInView || undefined}
      tabIndex={footerInView ? -1 : undefined}
    >
      <WhatsAppIcon className="h-6 w-6" color="#25D366" />
    </a>
  );
}

function useFooterInView(pathname) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    observer.observe(footer);
    return () => observer.disconnect();
    // The footer is part of the layout; re-query on navigation in case it was re-rendered.
  }, [pathname]);
  return inView;
}
