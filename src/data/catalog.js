// ─────────────────────────────────────────────────────────────────────────────
// Catalog contract + built-in demo data.
//
// The storefront runs on this data until the Supabase catalog has products.
// Admin → "Import demo catalog" copies everything below into the database so
// it can be edited or deleted. Keep the client "shape" documented here in sync
// with the row mappers at the bottom (DB rows are snake_case, the app is camelCase).
//
// Demo products and their photos are generated into ./demo-products.js by
// scripts/demo-catalog/build.mjs (borrowed product photography for the demo, see
// public/image/ATTRIBUTIONS.md and README → Demo catalog).
// ─────────────────────────────────────────────────────────────────────────────
import { DEMO_CATEGORY_IMAGES, DEMO_COLLECTIONS, DEMO_HERO_IMAGES, DEMO_PRODUCTS } from "./demo-products.js";

export const STORE = {
  name: "Al Habib Garments Mall",
  shortName: "Al Habib",
  city: "Kunzer, Tangmarg",
  whatsapp: "919622553899",
};

// Departments the store can stock. The storefront only shows the ones that
// currently have products (see ShopContext.departments), so Kids appears the
// moment the first kids product is added from the admin.
export const DEPARTMENTS = [
  { key: "men", name: "Men", tagline: "Jackets, hoodies, tees and track pants for every day of the week." },
  { key: "women", name: "Women", tagline: "Layers, tops and leggings, cut to move." },
  { key: "kids", name: "Kids", tagline: "Everyday wear and winter warmth for little ones." },
  { key: "accessories", name: "Bags & Accessories", navLabel: "Bags", tagline: "Trolleys, duffles, backpacks and beanies." },
];

export const SIZE_SETS = {
  apparel: { label: "Apparel", sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] },
  waist: { label: "Waist (inches)", sizes: ["28", "30", "32", "34", "36", "38", "40", "42", "44"] },
  kids: {
    label: "Kids (years)",
    sizes: ["1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y", "10-11Y", "11-12Y", "12-13Y", "13-14Y"],
  },
  free: { label: "Free size", sizes: ["Free Size"] },
};

export const BADGES = ["", "New", "Bestseller", "Limited", "Sale"];

// Ordered display of product detail keys (admin can add any extra key too).
export const DETAIL_FIELDS = [
  ["highlights", "Highlights"],
  ["fabric", "Fabric"],
  ["fit", "Fit"],
  ["sleeve", "Sleeve"],
  ["neck", "Neck"],
  ["pattern", "Pattern"],
  ["length", "Length"],
  ["dimensions", "Dimensions"],
  ["closure", "Closure"],
  ["lining", "Lining"],
  ["occasion", "Occasion"],
  ["washCare", "Wash care"],
  ["origin", "Origin"],
];

// Categories: key is `${department}-${slug}` and is what products reference.
const C = (department, slug, name, sizeSet, description = "") => ({
  key: `${department}-${slug}`,
  department,
  slug,
  name,
  sizeSet,
  description,
  imageUrl: DEMO_CATEGORY_IMAGES[`${department}-${slug}`] || "",
  sortOrder: 0,
  isActive: true,
});

export const CATEGORIES = [
  C("men", "t-shirts", "T-Shirts", "apparel", "Crew, V-neck and henley tees in soft cotton knits."),
  C("men", "sweatshirts", "Sweatshirts & Hoodies", "apparel", "Fleece hoodies and crewnecks for the cold months."),
  C("men", "jackets", "Jackets", "apparel", "Puffers, fleece-lined jackets, windbreakers and overcoats."),
  C("men", "track-pants", "Track Pants & Joggers", "waist", "Straight-leg track pants, joggers and lounge pants."),
  C("men", "shorts", "Shorts", "waist", "Lightweight shorts for warm afternoons."),
  C("men", "vests", "Vests & Basics", "apparel", "Everyday vests, multipacks and base layers."),
  C("women", "tops", "Tops & T-Shirts", "apparel", "Embroidered linen tops, tunics, blouses and tees."),
  C("women", "sweatshirts", "Sweatshirts & Hoodies", "apparel", "Pullover and zip hoodies, half-zips and sweatshirts in soft fleece."),
  C("women", "jackets", "Jackets", "apparel", "Puffers, parkas, rain jackets and trench coats."),
  C("women", "leggings", "Leggings & Track Pants", "apparel", "Leggings, tights and relaxed track pants."),
  C("kids", "boys", "Boys", "kids", "Tees, shirts and sets for boys."),
  C("kids", "girls", "Girls", "kids", "Frocks, tops and sets for girls."),
  C("kids", "winter-wear", "Winter Wear", "kids", "Jackets, sweaters and fleece for kids."),
  C("accessories", "bags", "Bags & Luggage", "free", "Trolleys, duffles, backpacks, totes and messenger bags."),
  C("accessories", "beanies", "Caps & Beanies", "free", "Knit beanies, skull caps and trapper hats for the valley's winter."),
].map((c, i) => ({ ...c, sortOrder: (i + 1) * 10 }));

export const getCategory = (key, categories = CATEGORIES) => categories.find((c) => c.key === key) || null;

export const departmentName = (key) => DEPARTMENTS.find((d) => d.key === key)?.name || "";

export const slugifyColor = (color) => String(color).toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const PRODUCTS = DEMO_PRODUCTS;

export const BANNERS = [
  {
    id: "dummy-hero-1",
    placement: "hero",
    title: "Winter, layered.",
    subtitle: "Puffers, parkas, hoodies and fleece built for Kunzer's cold.",
    ctaLabel: "Shop winter layers",
    ctaLink: "/collections/winter-layers",
    imageUrl: DEMO_HERO_IMAGES["hero-winter"],
    theme: "light",
    sortOrder: 10,
    isActive: true,
  },
  {
    id: "dummy-hero-2",
    placement: "hero",
    title: "Everyday, done well.",
    subtitle: "Tees, track pants and basics that carry the week.",
    ctaLabel: "Shop essentials",
    ctaLink: "/collections/everyday-essentials",
    imageUrl: DEMO_HERO_IMAGES["hero-everyday"],
    theme: "light",
    sortOrder: 20,
    isActive: true,
  },
  {
    id: "dummy-strip-1",
    placement: "strip",
    title: "Packed for the road.",
    subtitle: "Trolleys, duffles and backpacks for the drive to Srinagar and beyond.",
    ctaLabel: "Shop bags & luggage",
    ctaLink: "/shop/accessories/bags",
    imageUrl: "/image/art/strip-kashmir.svg",
    theme: "dark",
    sortOrder: 10,
    isActive: true,
  },
];

export const COLLECTIONS = DEMO_COLLECTIONS.map((c, i) => ({ id: `dummy-col-${c.slug}`, ...c, sortOrder: (i + 1) * 10, isActive: true }));

export const SIZE_GUIDES = [
  {
    id: "dummy-sg-men-apparel",
    slug: "men-apparel",
    title: "Men's apparel",
    appliesTo: { departments: ["men"], sizeSets: ["apparel"] },
    columns: ["Size", "Chest (in)", "Shoulder (in)", "Length (in)"],
    rows: [["XS", "36", "16.5", "27"], ["S", "38", "17", "28"], ["M", "40", "17.5", "29"], ["L", "42", "18", "30"], ["XL", "44", "18.5", "31"], ["XXL", "46", "19", "32"], ["3XL", "48", "19.5", "33"]],
    note: "Measure a shirt or jacket that fits you well and compare. Hoodies and jackets are cut with room to layer.",
  },
  {
    id: "dummy-sg-women-apparel",
    slug: "women-apparel",
    title: "Women's apparel",
    appliesTo: { departments: ["women"], sizeSets: ["apparel"] },
    columns: ["Size", "Bust (in)", "Waist (in)", "Hip (in)"],
    rows: [["XS", "32", "26", "35"], ["S", "34", "28", "37"], ["M", "36", "30", "39"], ["L", "38", "32", "41"], ["XL", "40", "34", "43"], ["XXL", "42", "36", "45"], ["3XL", "44", "38", "47"]],
    note: "Leggings and tights are body-hugging; if between sizes, take the larger one for jackets and the smaller one for leggings.",
  },
  {
    id: "dummy-sg-waist",
    slug: "waist",
    title: "Track pants, trousers and shorts",
    appliesTo: { departments: ["men", "women"], sizeSets: ["waist"] },
    columns: ["Size", "Waist (in)", "Hip (in)", "Inseam (in)"],
    rows: [["28", "28", "35", "32"], ["30", "30", "37", "32"], ["32", "32", "39", "32"], ["34", "34", "41", "32"], ["36", "36", "43", "32"], ["38", "38", "45", "32"], ["40", "40", "47", "32"], ["42", "42", "49", "32"], ["44", "44", "51", "32"]],
    note: "Sizes are the actual waist measurement in inches. We hem free of charge in store.",
  },
  {
    id: "dummy-sg-kids",
    slug: "kids",
    title: "Kids",
    appliesTo: { departments: ["kids"], sizeSets: ["kids"] },
    columns: ["Size", "Height (cm)", "Chest (in)", "Waist (in)"],
    rows: [["1-2Y", "80-92", "20", "19"], ["2-3Y", "92-98", "21", "20"], ["3-4Y", "98-104", "22", "21"], ["4-5Y", "104-110", "23", "21.5"], ["5-6Y", "110-116", "24", "22"], ["6-7Y", "116-122", "25", "22.5"], ["7-8Y", "122-128", "26", "23"], ["8-9Y", "128-134", "27", "23.5"], ["9-10Y", "134-140", "28", "24"], ["10-11Y", "140-146", "29", "25"], ["11-12Y", "146-152", "30", "26"], ["12-13Y", "152-158", "31", "27"], ["13-14Y", "158-164", "32", "28"]],
    note: "Go by height first. If between sizes, size up.",
  },
];

export const DEFAULT_SETTINGS = {
  storeName: "Al Habib Garments Mall",
  tagline: "Kunzer, Tangmarg",
  whatsappNumber: "919622553899",
  phoneDisplay: "+91 96225 53899",
  email: "",
  address: "Main Market, Kunzer, Tangmarg, Baramulla, Jammu & Kashmir",
  mapsQuery: "Al Habib Garments Mall, Kunzer, Tangmarg",
  hours: "Open every day, 10:00 AM to 8:00 PM",
  instagram: "alhabibgarments",
  facebook: "https://www.facebook.com/alhabibgm/",
  deliveryFee: 99,
  freeDeliveryOver: 1999,
  codEnabled: true,
  deliveryNote: "Dispatched within 24 hours. 2 to 4 days across Jammu & Kashmir, 5 to 8 days across India.",
  returnDays: 7,
  announcementText: "Free delivery from ₹1,999 · Order directly on WhatsApp",
  announcementEnabled: true,
  about:
    "Al Habib Garments Mall is Kunzer's multi-brand garments store, a short drive from Tangmarg on the road to Gulmarg. Jackets, hoodies, tees, track pants, bags and winter accessories for men, women and kids, chosen by hand and priced for families. Every order is confirmed personally on WhatsApp.",
};

// ── Row mappers (DB snake_case ↔ app camelCase) ────────────────────────────
const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const arr = (v) => (Array.isArray(v) ? v : []);
const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

export const normalizeVariant = (v = {}) => ({
  color: String(v.color || "").trim() || "Default",
  hex: /^#[0-9a-f]{3,8}$/i.test(String(v.hex || "")) ? v.hex : "#999999",
  images: arr(v.images).map((s) => String(s || "")).filter(Boolean),
  stock: Object.fromEntries(Object.entries(obj(v.stock)).map(([k, n]) => [k, Math.max(0, Math.floor(num(n)))])),
});

export const mapProductRow = (row) => {
  const variants = arr(row.variants).map(normalizeVariant);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title || "",
    brand: row.brand || "Al Habib",
    department: row.department || "men",
    categoryKey: row.category_key || "",
    badge: row.badge || "",
    shortInfo: row.short_info || "",
    description: row.description || "",
    details: obj(row.details),
    mrp: num(row.mrp),
    price: num(row.price),
    sizeSet: row.size_set || "apparel",
    sizes: arr(row.sizes).map(String),
    variants,
    tags: arr(row.tags).map(String),
    sortOrder: num(row.sort_order),
    isActive: row.is_active !== false,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
};

export const productToRow = (p) => ({
  ...(p.id && !String(p.id).startsWith("dummy-") ? { id: p.id } : {}),
  slug: p.slug,
  title: p.title,
  brand: p.brand || "Al Habib",
  department: p.department,
  category_key: p.categoryKey,
  badge: p.badge || "",
  short_info: p.shortInfo || "",
  description: p.description || "",
  details: obj(p.details),
  mrp: num(p.mrp),
  price: num(p.price),
  size_set: p.sizeSet || "apparel",
  sizes: arr(p.sizes),
  variants: arr(p.variants).map(normalizeVariant),
  tags: arr(p.tags),
  sort_order: num(p.sortOrder),
  is_active: p.isActive !== false,
});

export const mapCategoryRow = (row) => ({
  key: row.key,
  department: row.department,
  slug: row.slug,
  name: row.name,
  sizeSet: row.size_set || "apparel",
  description: row.description || "",
  imageUrl: row.image_url || "",
  sortOrder: num(row.sort_order),
  isActive: row.is_active !== false,
});

export const categoryToRow = (c) => ({
  key: c.key,
  department: c.department,
  slug: c.slug,
  name: c.name,
  size_set: c.sizeSet || "apparel",
  description: c.description || "",
  image_url: c.imageUrl || "",
  sort_order: num(c.sortOrder),
  is_active: c.isActive !== false,
});

export const mapBannerRow = (row) => ({
  id: row.id,
  placement: row.placement || "hero",
  title: row.title || "",
  subtitle: row.subtitle || "",
  ctaLabel: row.cta_label || "",
  ctaLink: row.cta_link || "",
  imageUrl: row.image_url || "",
  theme: row.theme === "light" ? "light" : "dark",
  sortOrder: num(row.sort_order),
  isActive: row.is_active !== false,
});

export const bannerToRow = (b) => ({
  ...(b.id && !String(b.id).startsWith("dummy-") ? { id: b.id } : {}),
  placement: b.placement || "hero",
  title: b.title || "",
  subtitle: b.subtitle || "",
  cta_label: b.ctaLabel || "",
  cta_link: b.ctaLink || "",
  image_url: b.imageUrl || "",
  theme: b.theme === "light" ? "light" : "dark",
  sort_order: num(b.sortOrder),
  is_active: b.isActive !== false,
});

export const mapCollectionRow = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name || "",
  description: row.description || "",
  imageUrl: row.image_url || "",
  productSlugs: arr(row.product_slugs).map(String),
  sortOrder: num(row.sort_order),
  isActive: row.is_active !== false,
});

export const collectionToRow = (c) => ({
  ...(c.id && !String(c.id).startsWith("dummy-") ? { id: c.id } : {}),
  slug: c.slug,
  name: c.name || "",
  description: c.description || "",
  image_url: c.imageUrl || "",
  product_slugs: arr(c.productSlugs),
  sort_order: num(c.sortOrder),
  is_active: c.isActive !== false,
});

export const mapSizeGuideRow = (row) => ({
  id: row.id,
  slug: row.slug,
  title: row.title || "",
  appliesTo: { departments: arr(obj(row.applies_to).departments), sizeSets: arr(obj(row.applies_to).sizeSets) },
  columns: arr(row.columns).map(String),
  rows: arr(row.rows).map((r) => arr(r).map(String)),
  note: row.note || "",
});

export const sizeGuideToRow = (g) => ({
  ...(g.id && !String(g.id).startsWith("dummy-") ? { id: g.id } : {}),
  slug: g.slug,
  title: g.title || "",
  applies_to: { departments: arr(g.appliesTo?.departments), sizeSets: arr(g.appliesTo?.sizeSets) },
  columns: arr(g.columns),
  rows: arr(g.rows),
  note: g.note || "",
});

export const mapCouponRow = (row) => ({
  id: row.id,
  code: row.code,
  type: row.type === "flat" ? "flat" : "percent",
  value: num(row.value),
  minOrder: num(row.min_order),
  maxDiscount: row.max_discount == null ? null : num(row.max_discount),
  startsAt: row.starts_at || null,
  expiresAt: row.expires_at || null,
  usageLimit: row.usage_limit == null ? null : num(row.usage_limit),
  usedCount: num(row.used_count),
  isActive: row.is_active !== false,
  createdAt: row.created_at || null,
});

export const couponToRow = (c) => ({
  ...(c.id ? { id: c.id } : {}),
  code: String(c.code || "").trim().toUpperCase(),
  type: c.type === "flat" ? "flat" : "percent",
  value: num(c.value),
  min_order: num(c.minOrder),
  max_discount: c.maxDiscount == null || c.maxDiscount === "" ? null : num(c.maxDiscount),
  starts_at: c.startsAt || null,
  expires_at: c.expiresAt || null,
  usage_limit: c.usageLimit == null || c.usageLimit === "" ? null : num(c.usageLimit),
  is_active: c.isActive !== false,
});

export const mapReviewRow = (row) => ({
  id: row.id,
  productId: row.product_id,
  productSlug: row.product_slug || "",
  name: row.name || "",
  rating: num(row.rating),
  title: row.title || "",
  body: row.body || "",
  isApproved: Boolean(row.is_approved),
  createdAt: row.created_at || null,
});

export const mapOrderRow = (row) => ({
  id: row.id,
  orderNumber: row.order_number,
  status: row.status || "new",
  customer: {
    name: row.customer_name || "",
    phone: row.phone || "",
    address: row.address || "",
    city: row.city || "",
    pincode: row.pincode || "",
    note: row.note || "",
  },
  items: arr(row.items),
  subtotal: num(row.subtotal),
  discount: num(row.discount),
  couponCode: row.coupon_code || "",
  deliveryFee: num(row.delivery_fee),
  total: num(row.total),
  stockApplied: Boolean(row.stock_applied),
  statusHistory: arr(row.status_history),
  adminNote: row.admin_note || "",
  createdAt: row.created_at || null,
  updatedAt: row.updated_at || null,
});

export const ORDER_STATUSES = [
  { key: "new", label: "New", description: "Received from the website, awaiting confirmation on WhatsApp." },
  { key: "confirmed", label: "Confirmed", description: "Confirmed with the customer. Stock is reserved." },
  { key: "packed", label: "Packed", description: "Packed and ready for dispatch." },
  { key: "shipped", label: "Shipped", description: "Handed to the courier." },
  { key: "delivered", label: "Delivered", description: "Delivered to the customer." },
  { key: "cancelled", label: "Cancelled", description: "Cancelled. Reserved stock is released." },
];

const SETTINGS_MAP = {
  storeName: "store_name",
  tagline: "tagline",
  whatsappNumber: "whatsapp_number",
  phoneDisplay: "phone_display",
  email: "email",
  address: "address",
  mapsQuery: "maps_query",
  hours: "hours",
  instagram: "instagram",
  facebook: "facebook",
  deliveryFee: "delivery_fee",
  freeDeliveryOver: "free_delivery_over",
  codEnabled: "cod_enabled",
  deliveryNote: "delivery_note",
  returnDays: "return_days",
  announcementText: "announcement_text",
  announcementEnabled: "announcement_enabled",
  about: "about",
};

export const mapSettingsRow = (row) => {
  if (!row) return { ...DEFAULT_SETTINGS };
  const out = { ...DEFAULT_SETTINGS };
  Object.entries(SETTINGS_MAP).forEach(([camel, snake]) => {
    if (row[snake] !== undefined && row[snake] !== null) out[camel] = row[snake];
  });
  out.deliveryFee = num(out.deliveryFee);
  out.freeDeliveryOver = num(out.freeDeliveryOver);
  out.returnDays = num(out.returnDays, 7);
  out.codEnabled = Boolean(out.codEnabled);
  out.announcementEnabled = Boolean(out.announcementEnabled);
  return out;
};

export const settingsToRow = (s) => {
  const out = { id: 1 };
  Object.entries(SETTINGS_MAP).forEach(([camel, snake]) => {
    if (s[camel] !== undefined) out[snake] = s[camel];
  });
  return out;
};
