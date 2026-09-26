// Pure helpers for the settings admin: form ↔ settings shape, validation and previews.
import { DEFAULT_SETTINGS } from "../../../data/catalog";

export const SECTIONS = [
  { id: "store", title: "Store", description: "The name and story customers see in the header, footer and the About page." },
  { id: "contact", title: "Contact", description: "Where orders and questions go. The WhatsApp number receives every order placed on the site." },
  { id: "delivery", title: "Delivery & returns", description: "Fees and promises shown in the bag, on product pages and in the policies." },
  { id: "announcement", title: "Announcement bar", description: "The thin black strip at the very top of every page. Good for offers and delivery news." },
];

// Which section a field lives in, so a failed save can scroll to the first problem.
export const FIELD_SECTION = {
  storeName: "store", tagline: "store", about: "store",
  whatsappNumber: "contact", phoneDisplay: "contact", email: "contact", address: "contact", mapsQuery: "contact", hours: "contact", instagram: "contact", facebook: "contact",
  deliveryFee: "delivery", freeDeliveryOver: "delivery", codEnabled: "delivery", deliveryNote: "delivery", returnDays: "delivery",
  announcementEnabled: "announcement", announcementText: "announcement",
};

export const ANNOUNCEMENT_MAX = 140;

const str = (v) => String(v ?? "");
const digits = (v) => String(v || "").replace(/\D/g, "");
const whole = (v) => v !== "" && Number.isInteger(Number(v));

// 10 digits is a bare Indian mobile: prefix the country code so wa.me links work.
export const cleanWhatsApp = (raw) => {
  const d = digits(raw);
  return d.length === 10 ? `91${d}` : d;
};
export const waPreview = (raw) => {
  const n = cleanWhatsApp(raw);
  return n.length >= 11 ? `wa.me/${n}` : "";
};

// Accepts "@alhabib", "instagram.com/alhabib/" or a bare handle.
export const cleanInstagram = (raw) =>
  str(raw)
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .trim();

// Inputs keep strings for numbers so the admin can clear a field while typing.
export const settingsToForm = (s = DEFAULT_SETTINGS) => ({
  storeName: str(s.storeName),
  tagline: str(s.tagline),
  about: str(s.about),
  whatsappNumber: str(s.whatsappNumber),
  phoneDisplay: str(s.phoneDisplay),
  email: str(s.email),
  address: str(s.address),
  mapsQuery: str(s.mapsQuery),
  hours: str(s.hours),
  instagram: str(s.instagram),
  facebook: str(s.facebook),
  deliveryFee: str(Number(s.deliveryFee) || 0),
  freeDeliveryOver: str(Number(s.freeDeliveryOver) || 0),
  codEnabled: s.codEnabled !== false,
  deliveryNote: str(s.deliveryNote),
  returnDays: str(Number.isFinite(Number(s.returnDays)) ? Number(s.returnDays) : 7),
  announcementText: str(s.announcementText),
  announcementEnabled: Boolean(s.announcementEnabled),
});

const int = (v, d = 0) => (whole(v) ? Math.max(0, Number(v)) : d);

export const formToSettings = (f) => ({
  storeName: f.storeName.trim(),
  tagline: f.tagline.trim(),
  about: f.about.trim(),
  whatsappNumber: cleanWhatsApp(f.whatsappNumber),
  phoneDisplay: f.phoneDisplay.trim(),
  email: f.email.trim(),
  address: f.address.trim(),
  mapsQuery: f.mapsQuery.trim(),
  hours: f.hours.trim(),
  instagram: cleanInstagram(f.instagram),
  facebook: f.facebook.trim(),
  deliveryFee: int(f.deliveryFee),
  freeDeliveryOver: int(f.freeDeliveryOver),
  codEnabled: Boolean(f.codEnabled),
  deliveryNote: f.deliveryNote.trim(),
  returnDays: int(f.returnDays, 7),
  announcementText: f.announcementText.trim().slice(0, ANNOUNCEMENT_MAX),
  announcementEnabled: Boolean(f.announcementEnabled),
});

export const snapshot = (f) => JSON.stringify(formToSettings(f));
export const isDirty = (form, base) => Boolean(form && base) && snapshot(form) !== snapshot(base);

export const validateSettings = (f) => {
  const errors = {};
  if (!f.storeName.trim()) errors.storeName = "The store needs a name.";
  const wa = cleanWhatsApp(f.whatsappNumber);
  if (!wa) errors.whatsappNumber = "Enter the WhatsApp number that receives orders.";
  else if (wa.length < 11 || wa.length > 15) errors.whatsappNumber = "Enter the number with its country code, for example 919622553899.";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = "That does not look like an email address.";
  if (f.facebook.trim() && !/^https?:\/\/\S+$/i.test(f.facebook.trim())) errors.facebook = "Paste the full page link, starting with https://.";
  if (!whole(f.deliveryFee) || Number(f.deliveryFee) < 0) errors.deliveryFee = "Use a whole rupee amount. 0 means delivery is free.";
  if (!whole(f.freeDeliveryOver) || Number(f.freeDeliveryOver) < 0) errors.freeDeliveryOver = "Use a whole rupee amount. 0 means never free.";
  if (!whole(f.returnDays) || Number(f.returnDays) < 0) errors.returnDays = "Use a whole number of days. 0 means no returns.";
  if (f.announcementEnabled && !f.announcementText.trim()) errors.announcementText = "Write the announcement, or switch the bar off.";
  return errors;
};

export const firstErrorSection = (errors) => {
  const key = Object.keys(errors)[0];
  return key ? FIELD_SECTION[key] || null : null;
};
