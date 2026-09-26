import { formatINR } from "./format";

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

// Full order message sent from the bag.
export const buildOrderMessage = ({ storeName, orderNumber, lines, totals, customer, siteUrl }) => {
  const out = [];
  out.push(`*${storeName || "Al Habib Garments Mall"}*`);
  out.push(orderNumber ? `Order *${orderNumber}*` : "New order from the website");
  out.push("");
  lines.forEach((l, i) => {
    const variant = [l.color, l.size].filter(Boolean).join(" / ");
    out.push(`${i + 1}. ${l.title}${variant ? ` (${variant})` : ""} × ${l.qty} = ${formatINR(l.price * l.qty)}`);
  });
  out.push("");
  out.push(`Subtotal: ${formatINR(totals.subtotal)}`);
  if (totals.discount > 0) out.push(`Discount${totals.couponCode ? ` (${totals.couponCode})` : ""}: -${formatINR(totals.discount)}`);
  out.push(`Delivery: ${totals.deliveryFee > 0 ? formatINR(totals.deliveryFee) : "Free"}`);
  out.push(`*Total: ${formatINR(totals.total)}*`);
  out.push("");
  if (customer?.name) out.push(`Name: ${customer.name}`);
  if (customer?.phone) out.push(`Phone: ${customer.phone}`);
  const addr = [customer?.address, customer?.city, customer?.pincode].filter(Boolean).join(", ");
  if (addr) out.push(`Address: ${addr}`);
  if (customer?.note) out.push(`Note: ${customer.note}`);
  if (siteUrl && orderNumber) {
    out.push("");
    out.push(`Track: ${siteUrl}/track?order=${orderNumber}`);
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
