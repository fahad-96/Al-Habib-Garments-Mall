import React from "react";
import { ArrowUpRight } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "../../ui/SocialIcons";
import WhatsAppIcon from "../../ui/WhatsAppIcon";
import { waLink } from "../../../lib/whatsapp";

export const directionsUrl = (settings = {}) => {
  const query = settings.mapsQuery || [settings.storeName, settings.address].filter(Boolean).join(", ");
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "";
};

export const instagramUrl = (handle) => {
  const clean = String(handle || "").trim().replace(/^@/, "");
  if (!clean) return "";
  return /^https?:\/\//i.test(clean) ? clean : `https://instagram.com/${clean}`;
};

const instagramLabel = (handle) => {
  const clean = String(handle || "").trim().replace(/^@/, "");
  if (!clean) return "";
  return /^https?:\/\//i.test(clean) ? "Instagram" : `@${clean.replace(/\/+$/, "").split("/").pop()}`;
};

const LINK = "inline-flex min-h-10 items-center gap-2 text-2xs font-medium uppercase tracking-micro text-ink underline-offset-4 hover:underline";

// Spec-sheet style list of how to find and reach the shop. Used on About and Contact.
export default function StoreDetails({ settings = {}, showSocials = false, className = "" }) {
  const directions = directionsUrl(settings);
  const whatsapp = waLink(settings.whatsappNumber, `Hi ${settings.storeName || "Al Habib Garments Mall"}, I have a question.`);
  const ig = instagramUrl(settings.instagram);
  const fb = String(settings.facebook || "").trim();

  const rows = [
    settings.address && {
      label: "Address",
      value: (
        <>
          <p className="text-neutral-800">{settings.address}</p>
          {directions && (
            <a href={directions} target="_blank" rel="noreferrer" className={`${LINK} mt-1`}>
              Get directions
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </a>
          )}
        </>
      ),
    },
    settings.hours && { label: "Hours", value: <p className="text-neutral-800">{settings.hours}</p> },
    (settings.phoneDisplay || settings.whatsappNumber) && {
      label: "WhatsApp",
      value: (
        <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2.5 text-neutral-800 hover:text-ink">
          <WhatsAppIcon className="h-4 w-4 shrink-0" color="#25D366" />
          <span className="tabular-nums">{settings.phoneDisplay || `+${settings.whatsappNumber}`}</span>
        </a>
      ),
    },
    showSocials &&
      (ig || fb) && {
        label: "Follow",
        value: (
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {ig && (
              <a href={ig} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2.5 text-neutral-800 hover:text-ink">
                <InstagramIcon className="h-4 w-4" />
                <span>{instagramLabel(settings.instagram)}</span>
              </a>
            )}
            {fb && (
              <a href={fb} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2.5 text-neutral-800 hover:text-ink">
                <FacebookIcon className="h-4 w-4" />
                <span>Facebook</span>
              </a>
            )}
          </div>
        ),
      },
  ].filter(Boolean);

  if (!rows.length) return null;

  return (
    <dl className={`divide-y divide-line border-y border-line ${className}`}>
      {rows.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[5.5rem_1fr] gap-4 py-4 text-sm leading-relaxed sm:grid-cols-[7rem_1fr] sm:py-5">
          <dt className="eyebrow pt-1">{label}</dt>
          <dd className="min-w-0">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
