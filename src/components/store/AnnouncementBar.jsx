import React, { Fragment } from "react";
import { useShop } from "../../context/ShopContext";

// "A · B" announcements: on phones two messages sit on two clean lines with no separator;
// from sm up they share a line, and a non-breaking space keeps each "·" off the start of a line.
export default function AnnouncementBar() {
  const { settings } = useShop();
  const text = String(settings.announcementText || "").trim();
  if (!settings.announcementEnabled || !text) return null;
  const parts = text
    .split(/\s*·\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  const stack = parts.length === 2;
  return (
    <div className="bg-ink text-paper">
      <p className="container flex min-h-9 items-center justify-center py-2 text-center text-[10px] font-medium uppercase leading-snug tracking-[0.14em] sm:text-2xs sm:tracking-micro">
        <span className="text-balance">
          {parts.map((part, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <span aria-hidden="true" className={stack ? "hidden sm:inline" : undefined}>
                  {" · "}
                </span>
              )}
              <span className={stack ? "block sm:inline" : undefined}>{part}</span>
            </Fragment>
          ))}
        </span>
      </p>
    </div>
  );
}
