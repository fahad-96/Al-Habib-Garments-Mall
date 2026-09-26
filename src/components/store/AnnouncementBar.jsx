import React from "react";
import { useShop } from "../../context/ShopContext";

export default function AnnouncementBar() {
  const { settings } = useShop();
  if (!settings.announcementEnabled || !settings.announcementText) return null;
  return (
    <div className="bg-ink text-paper">
      <p className="container flex min-h-9 items-center justify-center py-2 text-center text-[10px] font-medium uppercase leading-snug tracking-[0.14em] sm:text-2xs sm:tracking-micro">
        <span className="text-balance">{settings.announcementText}</span>
      </p>
    </div>
  );
}
