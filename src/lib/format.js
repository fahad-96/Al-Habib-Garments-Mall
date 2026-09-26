// Formatting and small pure helpers shared by storefront and admin.

export const formatINR = (value, { compact = false } = {}) => {
  const n = Number(value) || 0;
  if (compact && n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export const discountPercent = (mrp, price) => {
  const m = Number(mrp) || 0;
  const p = Number(price) || 0;
  if (m <= 0 || p <= 0 || p >= m) return 0;
  return Math.round(((m - p) / m) * 100);
};

export const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const formatDate = (iso, opts = {}) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", ...opts });
};

export const formatDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

export const timeAgo = (iso) => {
  const d = new Date(iso).getTime();
  if (!d) return "";
  const diff = Math.max(0, Date.now() - d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
};

export const pluralize = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// Indian mobile: 10 digits starting 6-9, optionally prefixed by +91 / 91 / 0.
export const normalizePhone = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return "";
};

export const isValidPincode = (raw) => /^[1-9][0-9]{5}$/.test(String(raw || "").trim());

export const titleCase = (s) => String(s || "").replace(/\b\w/g, (c) => c.toUpperCase());

export const uniq = (arr) => Array.from(new Set(arr));

export const sanitizeImageUrl = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^blob:/i.test(value)) return value; // local previews in the admin editor
  return "";
};
