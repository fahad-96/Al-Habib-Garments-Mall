// Pure helpers for the coupons admin: form ↔ coupon shape, status, validation and the preview line.
import { evaluateCoupon } from "../../../lib/catalogUtils";
import { formatDate, formatINR } from "../../../lib/format";

export const PREVIEW_BAG = 2500;
export const CODE_MIN = 3;
export const CODE_MAX = 24;
const CODE_PATTERN = /^[A-Z0-9]+$/;

const int = (v) => Math.round(Number(v) || 0);
const isWhole = (v) => v !== "" && Number.isInteger(Number(v));
const pad = (n) => String(n).padStart(2, "0");

export const cleanCode = (raw) => String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_MAX);

// <input type="datetime-local"> works in the browser's local time; the database stores ISO.
export const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const fromLocalInput = (local) => {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export const blankCoupon = () => ({
  id: null,
  code: "",
  type: "percent",
  value: "",
  minOrder: "",
  maxDiscount: "",
  startsAt: "",
  expiresAt: "",
  usageLimit: "",
  usedCount: 0,
  isActive: true,
});

// Inputs keep strings so the admin can clear a field while typing.
export const couponToForm = (c) => ({
  id: c.id || null,
  code: c.code || "",
  type: c.type === "flat" ? "flat" : "percent",
  value: c.value ? String(c.value) : "",
  minOrder: c.minOrder ? String(c.minOrder) : "",
  maxDiscount: c.maxDiscount == null ? "" : String(c.maxDiscount),
  startsAt: toLocalInput(c.startsAt),
  expiresAt: toLocalInput(c.expiresAt),
  usageLimit: c.usageLimit == null ? "" : String(c.usageLimit),
  usedCount: Number(c.usedCount) || 0,
  isActive: c.isActive !== false,
});

export const formToCoupon = (f) => ({
  ...(f.id ? { id: f.id } : {}),
  code: cleanCode(f.code),
  type: f.type === "flat" ? "flat" : "percent",
  value: int(f.value),
  minOrder: int(f.minOrder),
  maxDiscount: f.type === "percent" && f.maxDiscount !== "" ? int(f.maxDiscount) : null,
  startsAt: fromLocalInput(f.startsAt),
  expiresAt: fromLocalInput(f.expiresAt),
  usageLimit: f.usageLimit === "" ? null : int(f.usageLimit),
  usedCount: Number(f.usedCount) || 0,
  isActive: f.isActive !== false,
});

export const validateCoupon = (f, existing = []) => {
  const errors = {};
  const code = cleanCode(f.code);
  if (!code) errors.code = "Enter a code.";
  else if (code.length < CODE_MIN) errors.code = `Use at least ${CODE_MIN} characters.`;
  else if (!CODE_PATTERN.test(code)) errors.code = "Letters and digits only, no spaces.";
  else if (existing.some((c) => c.code === code && c.id !== f.id)) errors.code = "That code is already in use.";

  if (f.value === "") errors.value = "Enter the discount.";
  else if (!isWhole(f.value) || Number(f.value) <= 0) errors.value = "Use a whole number above 0.";
  else if (f.type === "percent" && Number(f.value) > 100) errors.value = "A percentage cannot be over 100.";

  if (f.minOrder !== "" && (!isWhole(f.minOrder) || Number(f.minOrder) < 0)) errors.minOrder = "Use a whole rupee amount, or leave it empty.";
  if (f.type === "percent" && f.maxDiscount !== "" && (!isWhole(f.maxDiscount) || Number(f.maxDiscount) <= 0)) errors.maxDiscount = "Use a whole rupee amount above 0, or leave it empty.";
  if (f.usageLimit !== "" && (!isWhole(f.usageLimit) || Number(f.usageLimit) < 1)) errors.usageLimit = "Use a whole number of 1 or more, or leave it empty.";

  const starts = f.startsAt ? new Date(f.startsAt) : null;
  const expires = f.expiresAt ? new Date(f.expiresAt) : null;
  if (starts && Number.isNaN(starts.getTime())) errors.startsAt = "Enter a valid date and time.";
  if (expires && Number.isNaN(expires.getTime())) errors.expiresAt = "Enter a valid date and time.";
  else if (starts && expires && !errors.startsAt && expires <= starts) errors.expiresAt = "The expiry must come after the start.";

  return errors;
};

// Status pill, in the same order the store checks a coupon (see evaluateCoupon).
export const COUPON_STATUS = {
  active: { label: "Active", tone: "solid" },
  scheduled: { label: "Scheduled", tone: "outline" },
  expired: { label: "Expired", tone: "muted" },
  exhausted: { label: "Exhausted", tone: "muted" },
  inactive: { label: "Inactive", tone: "muted" },
};

export const couponStatus = (c, now = new Date()) => {
  if (!c || c.isActive === false) return "inactive";
  if (c.expiresAt && new Date(c.expiresAt) < now) return "expired";
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return "exhausted";
  if (c.startsAt && new Date(c.startsAt) > now) return "scheduled";
  return "active";
};

export const describeDiscount = (c) => (c.type === "flat" ? `${formatINR(c.value)} off` : `${Number(c.value) || 0}% off`);

export const describeValidity = (c) => {
  const from = formatDate(c.startsAt);
  const to = formatDate(c.expiresAt);
  if (from && to) return `${from} to ${to}`;
  if (from) return `From ${from}`;
  if (to) return `Until ${to}`;
  return "Always";
};

export const describeUsage = (c) => (c.usageLimit != null ? `${Number(c.usedCount) || 0} of ${c.usageLimit}` : `${Number(c.usedCount) || 0}`);

// "Bag of ₹2,500 → saves ₹500". Only the maths is previewed: schedule, usage and the
// active switch are shown by the status pill instead, so a scheduled coupon still previews.
export const previewCoupon = (f, bag = PREVIEW_BAG) => {
  const c = formToCoupon(f);
  if (!(c.value > 0)) return { bag, text: "Enter a discount to see what it saves.", valid: false };
  const res = evaluateCoupon({ ...c, isActive: true, usedCount: 0, startsAt: null, expiresAt: null }, bag);
  if (res.valid) {
    const capped = c.type === "percent" && c.maxDiscount != null && res.discount === c.maxDiscount;
    return { bag, valid: true, discount: res.discount, text: `saves ${formatINR(res.discount)}${capped ? " (capped)" : ""} · ${formatINR(bag - res.discount)} to pay` };
  }
  if (bag < c.minOrder) return { bag, valid: false, text: `no discount, the bag must be at least ${formatINR(c.minOrder)}` };
  return { bag, valid: false, text: "no discount" };
};

export const compareCoupons = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
