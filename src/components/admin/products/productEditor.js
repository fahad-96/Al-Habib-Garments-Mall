// Pure helpers for the product editor: blank product, validation, and the
// shaping that turns form state into what saveProduct expects.
import { DETAIL_FIELDS, SIZE_SETS } from "../../../data/catalog";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
export const DEFAULT_HEX = "#999999";
export const TITLE_MAX = 120;
export const SHORT_INFO_MAX = 140;

// Common shop colours. Typing one of these names fills the hex automatically.
export const COLOR_SUGGESTIONS = [
  ["Black", "#111111"],
  ["White", "#f4f4f4"],
  ["Ivory", "#efe9dc"],
  ["Charcoal", "#3a3a3a"],
  ["Grey", "#8a8a8a"],
  ["Navy", "#1f2a44"],
  ["Blue", "#3b5b8a"],
  ["Sky Blue", "#9cc3d9"],
  ["Olive", "#5a5f3d"],
  ["Bottle Green", "#1f4a3d"],
  ["Maroon", "#5a1f28"],
  ["Red", "#b03a3a"],
  ["Rust", "#a4502b"],
  ["Orange", "#d9782d"],
  ["Mustard", "#c7a23a"],
  ["Yellow", "#e0c04a"],
  ["Camel", "#b48a5a"],
  ["Beige", "#d9c9a8"],
  ["Brown", "#5b3a29"],
  ["Tan", "#c69c6d"],
  ["Dusty Rose", "#c48b8b"],
  ["Lavender", "#9a8fb8"],
  ["Teal", "#2f6f73"],
  ["Indigo", "#2b2f6b"],
];

export const hexForColorName = (name) => {
  const key = String(name || "").trim().toLowerCase();
  return COLOR_SUGGESTIONS.find(([n]) => n.toLowerCase() === key)?.[1] || "";
};

export const DETAIL_PLACEHOLDERS = {
  highlights: "Full-zip front · Elasticized cuffs",
  fabric: "100% cotton",
  fit: "Regular",
  sleeve: "Full",
  neck: "Crew",
  pattern: "Solid",
  length: "Hip length",
  closure: "Full zip",
  lining: "Brushed fleece",
  sole: "Rubber",
  occasion: "Daily, travel",
  washCare: "Machine wash cold. Line dry.",
  origin: "India",
};

const STANDARD_DETAIL_KEYS = new Set(DETAIL_FIELDS.map(([key]) => key));
export const isStandardDetail = (key) => STANDARD_DETAIL_KEYS.has(key);

export const sizesForSet = (sizeSet) => [...(SIZE_SETS[sizeSet]?.sizes || [])];

export const blankVariant = (color = "", hex = DEFAULT_HEX) => ({ color, hex, images: [], stock: {} });

export const blankProduct = (categories = []) => {
  const category = categories.find((c) => c.department === "men") || categories[0] || null;
  const sizeSet = category?.sizeSet || "apparel";
  return {
    id: null,
    slug: "",
    title: "",
    brand: "Al Habib",
    department: category?.department || "men",
    categoryKey: category?.key || "",
    badge: "",
    shortInfo: "",
    description: "",
    details: {},
    mrp: 0,
    price: 0,
    sizeSet,
    sizes: sizesForSet(sizeSet),
    variants: [blankVariant("Black", "#111111")],
    tags: [],
    sortOrder: 0,
    isActive: true,
    createdAt: null,
    updatedAt: null,
  };
};

export const duplicateOf = (product) => ({
  ...product,
  id: null,
  slug: `${product.slug}-copy`,
  title: `${product.title} (copy)`,
  createdAt: null,
  updatedAt: null,
});

export const parseTags = (text) => Array.from(new Set(String(text || "").split(",").map((t) => t.trim()).filter(Boolean)));

export const cleanDetails = (details = {}) =>
  Object.fromEntries(
    Object.entries(details)
      .map(([k, v]) => [String(k).trim(), String(v ?? "").trim()])
      .filter(([k, v]) => k && v)
  );

const wholeNumber = (n) => Math.max(0, Math.floor(Number(n) || 0));

// Form state → the product shape saveProduct expects. Drops empty details,
// stock for sizes that are no longer offered, stray whitespace and client keys.
export const cleanProduct = (p) => {
  const sizes = (p.sizes || []).filter(Boolean);
  return {
    ...p,
    title: String(p.title || "").trim(),
    slug: String(p.slug || "").trim(),
    brand: String(p.brand || "").trim() || "Al Habib",
    badge: p.badge || "",
    shortInfo: String(p.shortInfo || "").trim(),
    description: String(p.description || "").trim(),
    details: cleanDetails(p.details),
    mrp: wholeNumber(p.mrp),
    price: wholeNumber(p.price),
    sizes,
    variants: (p.variants || []).map((v) => ({
      color: String(v.color || "").trim(),
      hex: String(v.hex || "").trim().toLowerCase(),
      images: (v.images || []).filter(Boolean),
      stock: Object.fromEntries(sizes.map((s) => [s, wholeNumber(v.stock?.[s])])),
    })),
    tags: parseTags((p.tags || []).join(",")),
    sortOrder: Math.round(Number(p.sortOrder) || 0),
    isActive: p.isActive !== false,
  };
};

export const validateProduct = (p, categories = []) => {
  const errors = {};
  const title = String(p.title || "").trim();
  const slug = String(p.slug || "").trim();
  if (!title) errors.title = "Give the product a title.";
  else if (title.length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`;
  if (!slug) errors.slug = "The slug becomes the product's web address.";
  else if (!SLUG_PATTERN.test(slug)) errors.slug = "Use lowercase letters, numbers and single hyphens only.";
  if (!p.categoryKey) errors.categoryKey = "Choose a category.";
  else if (categories.length && !categories.some((c) => c.key === p.categoryKey)) errors.categoryKey = "This category no longer exists. Choose another.";

  const price = Number(p.price) || 0;
  const mrp = Number(p.mrp) || 0;
  if (price <= 0) errors.price = "Enter a selling price above zero.";
  if (mrp <= 0) errors.mrp = "Enter the MRP. Use the same figure as the price when there is no discount.";
  else if (price > mrp) errors.price = errors.price || "The price cannot be higher than the MRP.";

  if (!(p.sizes || []).length) errors.sizes = "Offer at least one size.";

  const variants = p.variants || [];
  if (!variants.length) errors.variants = "Add at least one colour.";
  const seen = new Set();
  variants.forEach((v, i) => {
    const name = String(v.color || "").trim();
    const key = name.toLowerCase();
    if (!name) errors[`variant-${i}`] = "Name this colour.";
    else if (seen.has(key)) errors[`variant-${i}`] = "Each colour needs a different name.";
    else if (!HEX_PATTERN.test(String(v.hex || "").trim())) errors[`variant-${i}`] = "Enter a hex colour like #1f2a44.";
    seen.add(key);
  });
  return errors;
};

const SECTION_FOR = { title: "basics", slug: "basics", categoryKey: "basics", price: "pricing", mrp: "pricing", sizes: "sizes", variants: "variants" };
export const sectionForError = (key) => (key.startsWith("variant") ? "variants" : SECTION_FOR[key] || "basics");
export const firstErrorSection = (errors) => {
  const first = Object.keys(errors)[0];
  return first ? sectionForError(first) : "";
};

export const countErrors = (errors) => Object.keys(errors).length;
