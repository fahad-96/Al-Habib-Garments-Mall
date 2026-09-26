// Pure helpers for the admin order screens: status flow, search, phone
// formatting and the CSV export. No React in here.
import { ORDER_STATUSES } from "../../../data/catalog";
import { formatDateTime, titleCase } from "../../../lib/format";

const STATUS_BY_KEY = Object.fromEntries(ORDER_STATUSES.map((s) => [s.key, s]));

export const STATUS_KEYS = ORDER_STATUSES.map((s) => s.key);
export const statusLabel = (key) => STATUS_BY_KEY[key]?.label || titleCase(key) || "Unknown";
export const statusDescription = (key) => STATUS_BY_KEY[key]?.description || "";

// The forward flow shown to the admin; cancellation sits outside it.
export const FLOW = ORDER_STATUSES.filter((s) => s.key !== "cancelled");
export const flowIndex = (key) => FLOW.findIndex((s) => s.key === key);

// One sensible next move per status. Cancel is offered separately until delivery.
export const NEXT_STEP = {
  new: { status: "confirmed", label: "Confirm order", hint: "Confirming reserves stock for every item in this order." },
  confirmed: { status: "packed", label: "Mark as packed", hint: "" },
  packed: { status: "shipped", label: "Mark as shipped", hint: "" },
  shipped: { status: "delivered", label: "Mark as delivered", hint: "" },
  cancelled: { status: "new", label: "Reopen as new", hint: "Reopening puts the order back in the queue. Stock is reserved again once you confirm it." },
};
export const canCancel = (status) => status !== "delivered" && status !== "cancelled";

export const itemCount = (order) => (Array.isArray(order?.items) ? order.items : []).reduce((n, i) => n + (Number(i?.qty) || 0), 0);

export const digitsOf = (value) => String(value || "").replace(/\D/g, "");

// Orders store Indian mobiles as 10 digits; WhatsApp and tel: want the country code.
export const waNumber = (phone) => {
  const d = digitsOf(phone);
  return d.length === 10 ? `91${d}` : d;
};
export const telHref = (phone) => `tel:+${waNumber(phone)}`;
export const hasPhone = (phone) => digitsOf(phone).length >= 10;
export const formatPhone = (phone) => {
  const d = digitsOf(phone);
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  if (d.length === 12 && d.startsWith("91")) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return String(phone || "");
};

export const addressLines = (customer = {}) => {
  const cityLine = [customer.city, customer.pincode].filter(Boolean).join(" ");
  return [customer.address, cityLine].map((s) => String(s || "").trim()).filter(Boolean);
};

// What the Copy button puts on the clipboard: everything a courier label needs.
export const addressText = (order) => {
  const c = order?.customer || {};
  return [c.name, hasPhone(c.phone) ? formatPhone(c.phone) : c.phone, ...addressLines(c)].filter(Boolean).join("\n");
};

export const whatsappGreeting = (order, storeName) => `Hi ${order?.customer?.name || "there"}, this is ${storeName || "Al Habib Garments Mall"} about your order ${order?.orderNumber || ""}.`.trim();

// ── List filtering ─────────────────────────────────────────────────────────
export const matchesSearch = (order, term) => {
  const t = String(term || "").trim().toLowerCase();
  if (!t) return true;
  const hay = [order.orderNumber, order.customer?.name, order.customer?.city].map((s) => String(s || "").toLowerCase());
  if (hay.some((h) => h.includes(t))) return true;
  const digits = digitsOf(t);
  return digits.length >= 3 && digitsOf(order.customer?.phone).includes(digits);
};

export const filterOrders = (orders, { status = "all", search = "" } = {}) =>
  (orders || []).filter((o) => (status === "all" || o.status === status) && matchesSearch(o, search));

export const countByStatus = (orders) => {
  const counts = { all: 0 };
  STATUS_KEYS.forEach((k) => {
    counts[k] = 0;
  });
  (orders || []).forEach((o) => {
    counts.all += 1;
    counts[o.status] = (counts[o.status] || 0) + 1;
  });
  return counts;
};

// ── CSV export ─────────────────────────────────────────────────────────────
const csvCell = (value) => {
  const s = String(value ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const ordersToCsv = (orders) => {
  const header = ["Order", "Placed", "Customer", "Phone", "City", "Items", "Total", "Status"];
  const rows = (orders || []).map((o) => [
    o.orderNumber,
    formatDateTime(o.createdAt),
    o.customer?.name || "",
    o.customer?.phone || "",
    o.customer?.city || "",
    itemCount(o),
    Number(o.total) || 0,
    statusLabel(o.status),
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
};

export const csvFilename = (status = "all") => `al-habib-orders-${status}-${new Date().toISOString().slice(0, 10)}.csv`;

export const downloadCsv = (filename, csv) => {
  // The BOM makes Excel read the rupee amounts and names as UTF-8.
  const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
