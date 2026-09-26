// Pure helpers over the client product shape (see src/data/catalog.js).
import { discountPercent } from "./format";
import { SIZE_SETS } from "../data/catalog";

export const LOW_STOCK_AT = 3;
export const MAX_QTY_PER_LINE = 10;
export const NEW_WITHIN_DAYS = 45;

export const variantStock = (variant, size) => Math.max(0, Number(variant?.stock?.[size]) || 0);
export const variantTotalStock = (variant) => Object.values(variant?.stock || {}).reduce((s, n) => s + (Number(n) || 0), 0);
export const productTotalStock = (p) => (p?.variants || []).reduce((s, v) => s + variantTotalStock(v), 0);
export const isSoldOut = (p) => productTotalStock(p) <= 0;
export const isLowStock = (p) => {
  const t = productTotalStock(p);
  return t > 0 && t <= LOW_STOCK_AT;
};

export const primaryVariant = (p) => (p?.variants || []).find((v) => variantTotalStock(v) > 0) || p?.variants?.[0] || null;
export const productImage = (p, index = 0) => {
  const v = primaryVariant(p);
  return v?.images?.[index] || v?.images?.[0] || "";
};
export const productHoverImage = (p) => {
  const v = primaryVariant(p);
  return v?.images?.[1] || "";
};

export const getDiscount = (p) => discountPercent(p?.mrp, p?.price);

export const isNewProduct = (p) => {
  if (p?.badge === "New") return true;
  if (!p?.createdAt) return false;
  const age = Date.now() - new Date(p.createdAt).getTime();
  return age >= 0 && age < NEW_WITHIN_DAYS * 86400000;
};

export const sizeOrder = (sizeSet) => SIZE_SETS[sizeSet]?.sizes || [];
export const sortSizes = (sizes, sizeSet) => {
  const order = sizeOrder(sizeSet);
  return [...sizes].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return String(a).localeCompare(String(b), undefined, { numeric: true });
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
};

// ── Search ─────────────────────────────────────────────────────────────────
const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

export const scoreProduct = (p, tokens, categoryName = "") => {
  if (!tokens.length) return 0;
  const title = norm(p.title);
  const hay = [
    title,
    norm(categoryName),
    norm(p.department),
    norm(p.shortInfo),
    norm(p.badge),
    (p.tags || []).map(norm).join(" "),
    (p.variants || []).map((v) => norm(v.color)).join(" "),
    Object.values(p.details || {}).map(norm).join(" "),
  ].join(" | ");
  let score = 0;
  for (const t of tokens) {
    if (!t) continue;
    if (title === t) score += 50;
    else if (title.startsWith(t)) score += 20;
    else if (title.includes(t)) score += 12;
    else if (norm(categoryName).includes(t)) score += 8;
    else if (hay.includes(t)) score += 3;
    else return 0; // every token must match somewhere
  }
  return score;
};

export const searchProducts = (products, query, categories = []) => {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const catName = (key) => categories.find((c) => c.key === key)?.name || "";
  return products
    .map((p) => ({ p, s: scoreProduct(p, tokens, catName(p.categoryKey)) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || (a.p.sortOrder || 0) - (b.p.sortOrder || 0))
    .map((x) => x.p);
};

// Keys of categories that hold at least one active product (the ones navigation shows).
export const stockedCategoryKeys = (products = []) => new Set(products.filter((p) => p && p.isActive !== false).map((p) => p.categoryKey));

export const searchSuggestions = (products, categories, query, limit = 6) => {
  const q = norm(query).trim();
  if (!q) return { products: [], categories: [] };
  // Only suggest categories a shopper can browse: empty ones (Kids until it has stock) lead nowhere.
  const stocked = stockedCategoryKeys(products);
  const cats = categories
    .filter((c) => c.isActive !== false && stocked.has(c.key) && (norm(c.name).includes(q) || norm(`${c.department} ${c.name}`).includes(q)))
    .slice(0, 4);
  const prods = searchProducts(products, query, categories).slice(0, limit);
  return { products: prods, categories: cats };
};

// ── Filters ────────────────────────────────────────────────────────────────
export const EMPTY_FILTERS = {
  categories: [], // category keys
  sizes: [],
  colors: [], // colour names, case-insensitive
  min: null,
  max: null,
  discount: 0, // minimum discount %
  inStock: false,
  badges: [],
};

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "What's new" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "discount", label: "Better discount" },
];

export const applyFilters = (products, f = EMPTY_FILTERS) => {
  const colors = new Set((f.colors || []).map(norm));
  const sizes = new Set(f.sizes || []);
  const cats = new Set(f.categories || []);
  const badges = new Set(f.badges || []);
  return products.filter((p) => {
    if (cats.size && !cats.has(p.categoryKey)) return false;
    if (f.min != null && p.price < f.min) return false;
    if (f.max != null && p.price > f.max) return false;
    if (f.discount && getDiscount(p) < f.discount) return false;
    if (f.inStock && isSoldOut(p)) return false;
    if (badges.size && !badges.has(p.badge)) return false;
    if (colors.size && !(p.variants || []).some((v) => colors.has(norm(v.color)))) return false;
    if (sizes.size) {
      const has = (p.variants || []).some((v) => Object.entries(v.stock || {}).some(([s, n]) => sizes.has(s) && Number(n) > 0));
      const offered = (p.sizes || []).some((s) => sizes.has(s));
      if (!has && !offered) return false;
    }
    return true;
  });
};

export const sortProducts = (products, sort = "recommended") => {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) || (a.sortOrder || 0) - (b.sortOrder || 0));
    case "price_asc":
      return list.sort((a, b) => a.price - b.price);
    case "price_desc":
      return list.sort((a, b) => b.price - a.price);
    case "discount":
      return list.sort((a, b) => getDiscount(b) - getDiscount(a));
    default:
      // Recommended: in-stock first, then bestsellers/new, then manual sort order.
      return list.sort((a, b) => {
        const sa = isSoldOut(a) ? 1 : 0;
        const sb = isSoldOut(b) ? 1 : 0;
        if (sa !== sb) return sa - sb;
        const ba = a.badge === "Bestseller" ? 0 : a.badge === "New" ? 1 : 2;
        const bb = b.badge === "Bestseller" ? 0 : b.badge === "New" ? 1 : 2;
        if (ba !== bb) return ba - bb;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
  }
};

export const facetsFor = (products, categories = []) => {
  const sizeCount = new Map();
  const colorMap = new Map();
  const catCount = new Map();
  let min = Infinity;
  let max = 0;
  let discounted = 0;
  products.forEach((p) => {
    min = Math.min(min, p.price);
    max = Math.max(max, p.price);
    if (getDiscount(p) > 0) discounted += 1;
    catCount.set(p.categoryKey, (catCount.get(p.categoryKey) || 0) + 1);
    (p.sizes || []).forEach((s) => sizeCount.set(s, (sizeCount.get(s) || 0) + 1));
    (p.variants || []).forEach((v) => {
      const k = norm(v.color);
      const cur = colorMap.get(k) || { name: v.color, hex: v.hex, count: 0 };
      cur.count += 1;
      colorMap.set(k, cur);
    });
  });
  const sizeSetsPresent = Array.from(new Set(products.map((p) => p.sizeSet)));
  const orderedSizes = sizeSetsPresent.flatMap((set) => sizeOrder(set)).filter((s, i, a) => a.indexOf(s) === i);
  const sizes = orderedSizes.filter((s) => sizeCount.has(s)).map((s) => ({ value: s, count: sizeCount.get(s) }));
  const colors = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
  const cats = categories.filter((c) => catCount.has(c.key)).map((c) => ({ ...c, count: catCount.get(c.key) }));
  return {
    sizes,
    colors,
    categories: cats,
    priceRange: { min: Number.isFinite(min) ? min : 0, max },
    discounted,
  };
};

export const filtersFromSearchParams = (sp) => {
  const list = (k) => (sp.get(k) ? sp.get(k).split(",").map((s) => s.trim()).filter(Boolean) : []);
  const n = (k) => (sp.get(k) != null && sp.get(k) !== "" && !Number.isNaN(Number(sp.get(k))) ? Number(sp.get(k)) : null);
  return {
    categories: list("cat"),
    sizes: list("size"),
    colors: list("color"),
    min: n("min"),
    max: n("max"),
    discount: n("discount") || 0,
    inStock: sp.get("instock") === "1",
    badges: list("badge"),
  };
};

export const filtersToSearchParams = (f, sp = new URLSearchParams()) => {
  const set = (k, v) => (v ? sp.set(k, v) : sp.delete(k));
  set("cat", (f.categories || []).join(","));
  set("size", (f.sizes || []).join(","));
  set("color", (f.colors || []).join(","));
  set("min", f.min != null ? String(f.min) : "");
  set("max", f.max != null ? String(f.max) : "");
  set("discount", f.discount ? String(f.discount) : "");
  set("instock", f.inStock ? "1" : "");
  set("badge", (f.badges || []).join(","));
  return sp;
};

export const activeFilterCount = (f) =>
  (f.categories?.length || 0) + (f.sizes?.length || 0) + (f.colors?.length || 0) + (f.min != null || f.max != null ? 1 : 0) + (f.discount ? 1 : 0) + (f.inStock ? 1 : 0) + (f.badges?.length || 0);

// ── Related products ───────────────────────────────────────────────────────
export const relatedProducts = (product, all, n = 8) => {
  if (!product) return [];
  const tags = new Set(product.tags || []);
  return all
    .filter((p) => p.slug !== product.slug && p.isActive !== false)
    .map((p) => {
      let s = 0;
      if (p.categoryKey === product.categoryKey) s += 10;
      if (p.department === product.department) s += 4;
      (p.tags || []).forEach((t) => tags.has(t) && (s += 2));
      if (Math.abs(p.price - product.price) < product.price * 0.4) s += 1;
      if (isSoldOut(p)) s -= 5;
      return { p, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || (a.p.sortOrder || 0) - (b.p.sortOrder || 0))
    .slice(0, n)
    .map((x) => x.p);
};

// ── Cart totals + coupons (mirrors supabase/schema.sql place_order) ────────
export const evaluateCoupon = (coupon, subtotal, now = new Date()) => {
  if (!coupon) return { valid: false, discount: 0, message: "Coupon not found." };
  if (coupon.isActive === false) return { valid: false, discount: 0, message: "This coupon is no longer active." };
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return { valid: false, discount: 0, message: "This coupon is not active yet." };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return { valid: false, discount: 0, message: "This coupon has expired." };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return { valid: false, discount: 0, message: "This coupon has been fully redeemed." };
  if (subtotal < (coupon.minOrder || 0)) return { valid: false, discount: 0, message: `Add items worth ₹${(coupon.minOrder - subtotal).toLocaleString("en-IN")} more to use this coupon.` };
  let discount = coupon.type === "flat" ? coupon.value : Math.floor((subtotal * coupon.value) / 100);
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.max(0, Math.min(discount, subtotal));
  return { valid: discount > 0, discount, message: discount > 0 ? `Coupon applied. You save ₹${discount.toLocaleString("en-IN")}.` : "This coupon gives no discount on this bag." };
};

export const computeTotals = ({ lines = [], discount = 0, settings = {} }) => {
  const subtotal = lines.reduce((s, l) => s + (Number(l.price) || 0) * (Number(l.qty) || 0), 0);
  const mrpTotal = lines.reduce((s, l) => s + (Number(l.mrp || l.price) || 0) * (Number(l.qty) || 0), 0);
  const d = Math.max(0, Math.min(Number(discount) || 0, subtotal));
  const afterDiscount = subtotal - d;
  const fee = Number(settings.deliveryFee) || 0;
  const freeOver = Number(settings.freeDeliveryOver) || 0;
  const deliveryFee = afterDiscount <= 0 ? 0 : freeOver > 0 && afterDiscount >= freeOver ? 0 : fee;
  return { subtotal, mrpTotal, savings: mrpTotal - subtotal, discount: d, deliveryFee, total: afterDiscount + deliveryFee, itemCount: lines.reduce((s, l) => s + (Number(l.qty) || 0), 0) };
};
