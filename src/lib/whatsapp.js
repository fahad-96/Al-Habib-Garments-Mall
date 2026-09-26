import { formatINR, normalizePhone, oneLine } from "./format";

export const DEFAULT_WHATSAPP_NUMBER = "919622553899";

export const cleanWhatsAppNumber = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits.length >= 11 ? digits : DEFAULT_WHATSAPP_NUMBER;
};

export const waLink = (number, text) =>
  `https://wa.me/${cleanWhatsAppNumber(number)}?text=${encodeURIComponent(text)}`;

export const openWhatsApp = (number, text) => {
  window.open(waLink(number, text), "_blank", "noopener,noreferrer");
};

// Longest value kept for each delivery field (matches place_order in supabase/schema.sql).
export const CUSTOMER_LIMITS = { name: 80, phone: 20, address: 300, city: 80, pincode: 6, note: 500 };

// Customer text shown in the order message: each field on one line, without WhatsApp
// bold/strike/monospace markers, so nothing a shopper types can pass for a line of the
// order summary (a second "Total", a fake discount).
const customerField = (value, max) => oneLine(typeof value === "string" ? value.replace(/[*~`]+/g, " ") : value, max);

export const cleanCustomer = (customer = {}) => {
  const c = customer && typeof customer === "object" ? customer : {};
  const out = {};
  Object.entries(CUSTOMER_LIMITS).forEach(([key, max]) => {
    out[key] = customerField(c[key], max);
  });
  out.phone = normalizePhone(out.phone) || out.phone;
  out.pincode = oneLine(c.pincode, 20).replace(/\D/g, "").slice(0, CUSTOMER_LIMITS.pincode);
  return out;
};

// Full order message sent from the bag.
export const buildOrderMessage = ({ storeName, orderNumber, lines = [], totals = {}, customer, siteUrl }) => {
  const c = cleanCustomer(customer);
  const out = [];
  out.push(`*${storeName || "Al Habib Garments Mall"}*`);
  out.push(orderNumber ? `Order *${orderNumber}*` : "New order from the website");
  out.push("");
  lines.forEach((l, i) => {
    const variant = [oneLine(l.color, 40), oneLine(l.size, 20)].filter(Boolean).join(" / ");
    const qty = Number(l.qty) || 0;
    out.push(`${i + 1}. ${oneLine(l.title, 120) || "Item"}${variant ? ` (${variant})` : ""} × ${qty} = ${formatINR((Number(l.price) || 0) * qty)}`);
  });
  out.push("");
  out.push(`Subtotal: ${formatINR(totals.subtotal)}`);
  const coupon = oneLine(totals.couponCode, 24);
  if (Number(totals.discount) > 0) out.push(`Discount${coupon ? ` (${coupon})` : ""}: -${formatINR(totals.discount)}`);
  out.push(`Delivery: ${Number(totals.deliveryFee) > 0 ? formatINR(totals.deliveryFee) : "Free"}`);
  out.push(`*Total: ${formatINR(totals.total)}*`);
  out.push("");
  if (c.name) out.push(`Name: ${c.name}`);
  if (c.phone) out.push(`Phone: ${c.phone}`);
  const addr = [c.address, c.city, c.pincode].filter(Boolean).join(", ");
  if (addr) out.push(`Address: ${addr}`);
  if (c.note) out.push(`Note: ${c.note}`);
  if (siteUrl && orderNumber) {
    out.push("");
    out.push(`Track: ${siteUrl}/track?order=${encodeURIComponent(orderNumber)}`);
  }
  return out.join("\n");
};

// Quick enquiry from a product page.
export const buildProductEnquiry = ({ storeName, product, color, size, qty = 1, url }) => {
  const variant = [color, size].filter(Boolean).join(" / ");
  return [
    `Hi ${storeName || "Al Habib Garments Mall"}, I'd like to order:`,
    "",
    `${product.title}${variant ? ` (${variant})` : ""} × ${qty} — ${formatINR(product.price * qty)}`,
    url ? `\n${url}` : "",
  ]
    .join("\n")
    .trim();
};
