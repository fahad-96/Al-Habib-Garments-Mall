// Builds the built-in demo catalog:
//   - downloads the product-only photos listed in SPEC.SHOTS (seller listings on desertcart.in, served from
//     m.media-amazon.com) once into a local cache, trims their white margin and centres each product on a
//     clean white card,
//   - reads the bottoms and everyday bags from the Magento sample data CSV fixtures,
//   - applies the copy, colours and mappings in ./spec.mjs,
//   - writes every product photo as <name>.webp (900 × 1200) and <name>-sm.webp (450 × 600) under public/image/products,
//   - composes the hero, category and collection artwork in public/image/art,
//   - writes src/data/demo-products.js and public/image/ATTRIBUTIONS.md.
// The site only ever uses the files written here; nothing links to the photo sources.
//
// Usage (see README → Demo catalog):
//   npm i --no-save sharp
//   MAGENTO_SAMPLE_DIR=/path/to/magento2-sample-data node scripts/demo-catalog/build.mjs
// Downloaded photos are kept in DEMO_PHOTO_CACHE (default node_modules/.cache/demo-catalog). Behind an HTTPS
// proxy, add NODE_USE_ENV_PROXY=1 so Node's fetch uses it.
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as SPEC from "./spec.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MAGENTO_DIR = resolve(process.env.MAGENTO_SAMPLE_DIR || "/home/user/magento/sample");
const PHOTO_CACHE = resolve(process.env.DEMO_PHOTO_CACHE || join(ROOT, "node_modules/.cache/demo-catalog"));
const SHOT_PHOTO_URL = (id) => `https://m.media-amazon.com/images/I/${id}.jpg`;
const SHOT_LISTING_URL = (listing) => `https://www.desertcart.in/products/${listing}`;

const MAGENTO_MEDIA = join(MAGENTO_DIR, "pub/media/catalog/product");
const MAGENTO_APPAREL_CSV = join(MAGENTO_DIR, "app/code/Magento/ConfigurableSampleData/fixtures/products.csv");
const MAGENTO_BAGS_CSV = join(MAGENTO_DIR, "app/code/Magento/CatalogSampleData/fixtures/SimpleProduct/products_gear_bags.csv");
const MAGENTO_BAG_IMAGES_CSV = join(MAGENTO_DIR, "app/code/Magento/CatalogSampleData/fixtures/SimpleProduct/images_gear_bags.csv");

const OUT_PRODUCTS = join(ROOT, "public/image/products");
const OUT_ART = join(ROOT, "public/image/art");
const OUT_MODULE = join(ROOT, "src/data/demo-products.js");
const OUT_ATTRIBUTIONS = join(ROOT, "public/image/ATTRIBUTIONS.md");

const IMAGE = { width: 900, height: 1200, quality: 80 };
const IMAGE_SM = { width: 450, height: 600, quality: 78 };
// White margin around a product-only photo on its 900 × 1200 card, so every product sits the same way.
const SHOT_MARGIN = { x: 70, y: 80 };

const fail = (message) => {
  console.error(`\ndemo-catalog: ${message}\n`);
  process.exit(1);
};

// ── Inputs ───────────────────────────────────────────────────────────────────
const requireSource = (path, what, envVar) => {
  if (!existsSync(path)) fail(`${what} not found at ${path}.\nSet ${envVar} to your checkout (see README → Demo catalog).`);
};
requireSource(MAGENTO_APPAREL_CSV, "Magento sample data", "MAGENTO_SAMPLE_DIR");
requireSource(MAGENTO_MEDIA, "Magento sample photos (pub/media/catalog/product)", "MAGENTO_SAMPLE_DIR");

// sharp is a build-time tool only, so it is not a project dependency.
const loadSharp = () => {
  try {
    return createRequire(import.meta.url)("sharp");
  } catch (e) {
    const detail = e.code === "MODULE_NOT_FOUND" ? "" : `\n\n(sharp is installed but did not load: ${e.message})`;
    return fail(`this script needs "sharp" to resize the photos. Install it without saving it to package.json:\n\n  npm i --no-save sharp${detail}`);
  }
};
const sharp = loadSharp();

// RFC 4180 CSV (quoted fields may contain commas, quotes and newlines).
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) rows.push([...row, field]);
  const [head = [], ...body] = rows;
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ?? ""])));
};
const readCsv = (path) => parseCsv(readFileSync(path, "utf8"));

// Magento keeps photos at /x/y/name.jpg; the fixtures list them as "/x/y/name.jpg".
const mediaPath = (ref) => join(MAGENTO_MEDIA, ref.replace(/^\/+/, ""));
const stem = (path) => basename(path).replace(/\.[a-z]+$/i, "");

// Apparel: one configurable row per product, one simple row per size and colour. Photos per colour are
// the simple row's base image plus its front/back/detail shots (the lifestyle "outfit" and extra
// angle shots are left out).
const PHOTO_KINDS = /_(main|alt1|back)\.jpg$/i;
const extractApparel = () => {
  const rows = readCsv(MAGENTO_APPAREL_CSV);
  const attrs = (s) => Object.fromEntries(String(s).split(",").map((kv) => kv.split("=")).filter((p) => p.length === 2));
  const bySku = new Map();
  for (const row of rows.filter((r) => r.product_type === "configurable")) bySku.set(row.sku, { sku: row.sku, name: row.name, variants: [] });
  for (const row of rows.filter((r) => r.product_type === "simple")) {
    const parent = bySku.get(row.sku.split("-")[0]);
    const color = attrs(row.additional_attributes).color;
    if (!parent || !color) continue;
    let variant = parent.variants.find((v) => v.color === color);
    if (!variant) parent.variants.push((variant = { color, images: [] }));
    for (const ref of [row.base_image, ...String(row.additional_images || "").split(",")].map((s) => s.trim()).filter(Boolean)) {
      const file = mediaPath(ref);
      if (PHOTO_KINDS.test(file) && existsSync(file) && !variant.images.includes(file)) variant.images.push(file);
    }
  }
  return bySku;
};

// Bags: simple products with their photos in a separate fixture; the colour is part of the file name.
const extractBags = () => {
  const skus = new Set(readCsv(MAGENTO_BAGS_CSV).map((r) => r.sku));
  const images = new Map();
  for (const { sku, image } of readCsv(MAGENTO_BAG_IMAGES_CSV)) {
    const file = mediaPath(image);
    if (!existsSync(file)) continue;
    const token = (stem(file).match(/^[a-z0-9]+-([a-z]+)-/i) || [])[1]?.toLowerCase();
    if (!token) continue;
    if (!images.has(sku)) images.set(sku, {});
    (images.get(sku)[token] = images.get(sku)[token] || []).push(file);
  }
  return { skus, images };
};

// Product-only photos: downloaded once, then read from the cache.
const shotPhoto = async (id, where) => {
  const file = join(PHOTO_CACHE, `${id}.jpg`);
  if (existsSync(file) && statSync(file).size > 0) return file;
  mkdirSync(PHOTO_CACHE, { recursive: true });
  const url = SHOT_PHOTO_URL(id);
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    return fail(`${where}: could not download ${url} (${e.cause?.code || e.message}).\nBehind an HTTPS proxy, run the script with NODE_USE_ENV_PROXY=1.`);
  }
  if (!res.ok) fail(`${where}: ${url} answered HTTP ${res.status}.`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
};

// Trim the photo's white margin and centre the product on a white 900 × 1200 card.
const shotCard = async (file) => {
  const trimmed = await sharp(file).flatten({ background: "#ffffff" }).trim({ background: "#ffffff", threshold: 16 }).toBuffer();
  const { data, info } = await sharp(trimmed)
    .resize(IMAGE.width - 2 * SHOT_MARGIN.x, IMAGE.height - 2 * SHOT_MARGIN.y, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });
  return sharp({ create: { width: IMAGE.width, height: IMAGE.height, channels: 3, background: "#ffffff" } })
    .composite([{ input: data, left: Math.round((IMAGE.width - info.width) / 2), top: Math.round((IMAGE.height - info.height) / 2) }])
    .png()
    .toBuffer();
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (t) =>
  String(t)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const colorSlug = (c) => String(c).toLowerCase().replace(/[^a-z0-9]+/g, "-");

const colourOf = (value, where) => {
  const [name, hex] = Array.isArray(value) ? value : [value, SPEC.COLOR_HEX[value]];
  if (!hex) fail(`${where}: colour "${name}" is not in COLOR_HEX (add it, or give ["${name}", "#hex"]).`);
  if (!/^#[0-9a-f]{6}$/i.test(hex)) fail(`${where}: "${hex}" is not a #rrggbb colour.`);
  return { name, hex };
};

const stockFor = (sizes, pattern) => {
  const out = {};
  sizes.forEach((s, i) => {
    if (pattern === "low") out[s] = i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 0;
    else if (pattern === "one-out") out[s] = i === Math.floor(sizes.length / 2) ? 0 : 4 + (i % 3);
    else if (pattern === "high") out[s] = 8 + (i % 4);
    else out[s] = 3 + (i % 4);
  });
  return out;
};
const PATTERNS = ["mid", "high", "mid", "one-out", "high", "mid", "low"];

// ── Plan: every product with its copy, colours and source photos ─────────────
const MAGENTO = extractApparel();
const BAG_SOURCES = extractBags();
const catBy = Object.fromEntries(SPEC.CATEGORIES.map((c) => [c.key, c]));
const usedSlugs = new Set();
const uniqueSlug = (title, department) => {
  let s = slugify(title);
  if (usedSlugs.has(s)) s = `${s}-${department}`;
  let n = 2;
  while (usedSlugs.has(s)) s = `${slugify(title)}-${department}-${n++}`;
  usedSlugs.add(s);
  return s;
};

const planned = []; // { product, variants: [{ name, hex, files, ref }] }
const plan = ({ key, cat, title, short, price, mrp, badge, details, tags, highlights, more, variants }) => {
  const c = catBy[cat];
  if (!c) fail(`${key}: unknown category ${cat}.`);
  if (!variants.length) fail(`${key}: no photographed colours left.`);
  const names = variants.map((v) => v.name.toLowerCase());
  if (new Set(names).size !== names.length) fail(`${key}: two colours share a name (${variants.map((v) => v.name).join(", ")}).`);
  const slug = uniqueSlug(title, c.department);
  const index = planned.length;
  const templates = SPEC.DESCRIPTIONS[cat] || [""];
  const det = { ...details };
  if (highlights?.length) det.highlights = highlights.join(" · ");
  if (!det.washCare) det.washCare = SPEC.WASH_BY_CAT[cat] || SPEC.DEFAULT_WASH;
  const sizes = SPEC.SIZES_BY_CAT[cat];
  if (!sizes) fail(`${key}: no sizes for ${cat}.`);
  planned.push({
    key,
    variants,
    product: {
      id: `dummy-${slug}`,
      slug,
      title,
      brand: "Al Habib",
      department: c.department,
      categoryKey: cat,
      badge: badge || "",
      shortInfo: short,
      description: `${short} ${more || templates[index % templates.length]}`.trim(),
      details: det,
      mrp,
      price,
      sizeSet: c.sizeSet,
      sizes,
      variants: variants.map((v, vi) => ({ color: v.name, hex: v.hex, images: [], stock: stockFor(sizes, PATTERNS[(index + vi) % PATTERNS.length]) })),
      tags: tags || [],
      sortOrder: (index + 1) * 10,
      isActive: true,
      createdAt: new Date(Date.parse("2026-09-20T09:00:00Z") - index * 5 * 3600 * 1000).toISOString(),
    },
  });
};

const entries = []; // every product with its photo variants, before ordering
for (const a of SPEC.APPAREL) {
  const m = MAGENTO.get(a.sku);
  if (!m) fail(`no Magento product ${a.sku} in ${MAGENTO_APPAREL_CSV}.`);
  const skip = new Set(a.skip || []);
  const variants = m.variants
    .filter((v) => !(a.omit || []).includes(v.color))
    .map((v) => ({ ...colourOf(a.colors?.[v.color] ?? SPEC.COLOR_RENAME[v.color] ?? v.color, a.sku), files: v.images.filter((f) => !skip.has(stem(f))), ref: `${a.sku}/${v.color}` }))
    .filter((v) => v.files.length)
    .sort((x, y) => y.files.length - x.files.length); // the colour with the full photo set leads
  entries.push({ ...a, key: a.sku, variants });
}
for (const b of SPEC.BAGS) {
  if (!BAG_SOURCES.skus.has(b.sku)) fail(`no Magento bag ${b.sku} in ${MAGENTO_BAGS_CSV}.`);
  const photos = BAG_SOURCES.images.get(b.sku) || {};
  const variants = Object.entries(b.colors).map(([token, value]) => {
    if (!photos[token]?.length) fail(`${b.sku}: no "${token}" photo in ${MAGENTO_BAG_IMAGES_CSV}.`);
    return { ...colourOf(value, b.sku), files: photos[token], ref: `${b.sku}/${token}` };
  });
  entries.push({ ...b, key: b.sku, variants });
}
const shotIds = new Set();
for (const s of SPEC.SHOTS) {
  const variants = [];
  for (const v of s.variants) {
    const colour = colourOf(v.color, s.title);
    if (!/^\d+$/.test(v.listing)) fail(`${s.title}: listing "${v.listing}" is not a desertcart product number.`);
    if (!v.photos.length) fail(`${s.title} (${colour.name}): no photos.`);
    const files = [];
    for (const id of v.photos) {
      if (shotIds.has(id)) fail(`${s.title}: photo ${id} is used twice.`);
      shotIds.add(id);
      files.push(await shotPhoto(id, s.title));
    }
    variants.push({ ...colour, files, shot: true, listing: v.listing, ref: `${s.title}/${colour.name}` });
  }
  entries.push({ ...s, key: s.title, variants });
}
// Interleave the categories (in SPEC.CATEGORIES order) so the newest products, and "New in", mix them.
const queues = SPEC.CATEGORIES.map((c) => entries.filter((e) => e.cat === c.key));
const stray = entries.find((e) => !catBy[e.cat]);
if (stray) fail(`${stray.key}: unknown category ${stray.cat}.`);
while (queues.some((q) => q.length)) for (const q of queues) if (q.length) plan(q.shift());

// ── Checks before anything is written ────────────────────────────────────────
const problems = [];
for (const { key, product: p } of planned) {
  const copy = [p.title, p.shortInfo, p.description, ...Object.values(p.details), ...p.variants.map((v) => v.color)].join("\n");
  for (const re of SPEC.BANNED_COPY) if (re.test(copy)) problems.push(`${key} (${p.slug}): copy matches ${re}`);
}
try {
  const { CATEGORIES } = await import(pathToFileURL(join(ROOT, "src/data/catalog.js")).href);
  for (const c of SPEC.CATEGORIES) {
    const live = CATEGORIES.find((x) => x.key === c.key);
    if (!live) problems.push(`category ${c.key} is not in src/data/catalog.js`);
    else if (live.sizeSet !== c.sizeSet) problems.push(`category ${c.key}: size set ${c.sizeSet} here, ${live.sizeSet} in src/data/catalog.js`);
  }
} catch (e) {
  console.warn(`demo-catalog: could not load src/data/catalog.js to cross-check categories (${e.message}).`);
}
if (problems.length) fail(`fix the spec first:\n  ${problems.join("\n  ")}`);

// ── Photos ───────────────────────────────────────────────────────────────────
const writeProductImage = async (src, dir, name) => {
  await sharp(src).resize(IMAGE.width, IMAGE.height, { fit: "cover", position: "centre" }).webp({ quality: IMAGE.quality }).toFile(join(dir, `${name}.webp`));
  await sharp(src).resize(IMAGE_SM.width, IMAGE_SM.height, { fit: "cover", position: "centre" }).webp({ quality: IMAGE_SM.quality }).toFile(join(dir, `${name}-sm.webp`));
};

rmSync(OUT_PRODUCTS, { recursive: true, force: true });
mkdirSync(OUT_PRODUCTS, { recursive: true });
const photoIndex = {}; // photo reference ("Title/Colour" or "SKU/Magento colour") -> the colour's first photo
let written = 0;
for (const { variants, product } of planned) {
  const dir = join(OUT_PRODUCTS, product.slug);
  mkdirSync(dir, { recursive: true });
  for (let vi = 0; vi < variants.length; vi++) {
    const v = variants[vi];
    for (let i = 0; i < v.files.length; i++) {
      const name = `${colorSlug(v.name)}-${i + 1}`;
      const src = v.shot ? await shotCard(v.files[i]) : v.files[i];
      await writeProductImage(src, dir, name);
      product.variants[vi].images.push(`/image/products/${product.slug}/${name}.webp`);
      written += 2;
      if (i === 0) photoIndex[v.ref] = src;
    }
  }
}
const products = planned.map((p) => p.product);

// ── Artwork ──────────────────────────────────────────────────────────────────
const srcOf = (ref) => photoIndex[ref] || fail(`no photo for ${ref} (use "Product title/Colour" or "SKU/Magento colour", e.g. "MP07/Blue").`);
const backgroundOf = async (file) => {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const i = (4 * info.width + 4) * info.channels;
  return `#${[data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
// The photo sits on the right on a canvas of its own background colour, leaving room for copy on the left.
const compose = async (src, W, H, right) => {
  const photo = await sharp(src).resize({ height: H }).toBuffer();
  const { width } = await sharp(photo).metadata();
  return sharp({ create: { width: W, height: H, channels: 3, background: await backgroundOf(src) } })
    .composite([{ input: photo, left: Math.max(0, W - width - right), top: 0 }])
    .webp({ quality: 82 })
    .toBuffer();
};

// Hero slides are cropped hard on phones (object-right-top keeps only the right ~660 px of 1800), so the
// product is trimmed and fitted into a box on the right that stays inside that crop and inside the top
// 840 px a wide desktop screen shows.
const HERO = { width: 1800, height: 1100, box: { width: 560, height: 780, right: 100, top: 60 } };
// A model photo (`model: true`) is cut off at the bottom, so it is scaled to the full slide height and
// stands on the bottom edge instead of floating in the box.
const composeHero = async (src, { model = false } = {}) => {
  const { box } = HERO;
  const background = await backgroundOf(src);
  const trimmed = await sharp(src).trim({ background, threshold: 16 }).toBuffer();
  const fit = model ? { width: box.width, height: HERO.height - box.top } : box;
  const { data, info } = await sharp(trimmed).resize(fit.width, fit.height, { fit: "inside" }).toBuffer({ resolveWithObject: true });
  const left = HERO.width - box.right - info.width - Math.round((box.width - info.width) / 2);
  const top = model ? HERO.height - info.height : box.top + Math.round((box.height - info.height) / 2);
  return sharp({ create: { width: HERO.width, height: HERO.height, channels: 3, background } })
    .composite([{ input: data, left, top }])
    .webp({ quality: 82 })
    .toBuffer();
};

// A lifestyle photo (`scene`, a file in ./source) fills the whole slide. On wide screens the square photo
// sits on the right and fades into a deep tone taken from its own left edge, which carries the copy; on
// phones an upright crop keeps the subject (`focus`, 0 to 1 across the photo) in the middle.
const SCENE_FADE = 520;
const composeScene = async (file, focus = 0.5) => {
  const { width: w0, height: h0 } = await sharp(file).metadata();
  const graded = sharp(file).linear(1.04, -5); // a touch more contrast; nothing else is changed
  const H = HERO.height;
  const side = Math.round((H / h0) * w0);
  const { data: rgb, info } = await graded.clone().resize(side, H).raw().toBuffer({ resolveWithObject: true });
  const edge = [0, 1, 2].map((c) => {
    let sum = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < 120; x++) sum += rgb[(y * info.width + x) * 3 + c];
    return Math.round((sum / (H * 120)) * 0.5);
  });
  const rgba = Buffer.alloc(info.width * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < info.width; x++) {
      const i = y * info.width + x;
      rgba[i * 4] = rgb[i * 3];
      rgba[i * 4 + 1] = rgb[i * 3 + 1];
      rgba[i * 4 + 2] = rgb[i * 3 + 2];
      rgba[i * 4 + 3] = x >= SCENE_FADE ? 255 : Math.round(255 * (x / SCENE_FADE) ** 1.6);
    }
  const landscape = await sharp({ create: { width: HERO.width, height: H, channels: 3, background: { r: edge[0], g: edge[1], b: edge[2] } } })
    .composite([{ input: rgba, raw: { width: info.width, height: H, channels: 4 }, left: HERO.width - info.width, top: 0 }])
    .webp({ quality: 82 })
    .toBuffer();
  const cropW = Math.min(w0, Math.round(h0 * 0.62));
  const left = Math.max(0, Math.min(w0 - cropW, Math.round(w0 * focus - cropW / 2)));
  const portrait = await graded.clone().extract({ left, top: 0, width: cropW, height: h0 }).resize({ width: 820 }).webp({ quality: 82 }).toBuffer();
  return { landscape, portrait };
};

// Artwork file names carry a hash of their content, so a new version gets a new URL and is never
// hidden behind the week-long cache on /image/* (netlify.toml).
mkdirSync(OUT_ART, { recursive: true });
const artFiles = new Set();
const writeArt = (base, buffer) => {
  const file = `${base}-${createHash("sha256").update(buffer).digest("hex").slice(0, 8)}.webp`;
  writeFileSync(join(OUT_ART, file), buffer);
  artFiles.add(file);
  return `/image/art/${file}`;
};
const heroImages = {};
for (const h of SPEC.HEROES) {
  if (h.scene) {
    const file = join(dirname(fileURLToPath(import.meta.url)), "source", h.scene);
    if (!existsSync(file)) fail(`${h.name}: missing ${file}.`);
    const { landscape, portrait } = await composeScene(file, h.focus);
    heroImages[h.name] = writeArt(h.name, landscape);
    heroImages[`${h.name}-portrait`] = writeArt(`${h.name}-portrait`, portrait);
    continue;
  }
  const src = h.shot ? await shotPhoto(h.shot, h.name) : srcOf(h.photo);
  heroImages[h.name] = writeArt(h.name, await composeHero(src, { model: Boolean(h.shot) }));
}
// Department tiles can use a lifestyle photo too: a 4:5 crop (`box`: left, top, width as fractions of the photo).
const departmentImages = {};
for (const [key, d] of Object.entries(SPEC.DEPARTMENT_IMAGES || {})) {
  const file = join(dirname(fileURLToPath(import.meta.url)), "source", d.scene);
  if (!existsSync(file)) fail(`department ${key}: missing ${file}.`);
  const { width: w0, height: h0 } = await sharp(file).metadata();
  const width = Math.round(w0 * d.box.width);
  const height = Math.min(h0, Math.round(width * 1.25));
  const left = Math.round(w0 * d.box.left);
  const top = Math.min(h0 - height, Math.round(h0 * d.box.top));
  departmentImages[key] = writeArt(`dept-${key}`, await sharp(file).linear(1.04, -5).extract({ left, top, width, height }).resize(900, 1125).webp({ quality: 80 }).toBuffer());
}
const categoryImages = {};
for (const c of SPEC.CATEGORIES) {
  if (!c.image) continue;
  categoryImages[c.key] = writeArt(`cat-${c.key}`, await sharp(srcOf(c.image)).resize(800, 1000, { fit: "cover", position: "top" }).webp({ quality: 80 }).toBuffer());
}
const collections = [];
for (const col of SPEC.COLLECTIONS) {
  const imageUrl = writeArt(`col-${col.slug}`, await compose(srcOf(col.photo), 1200, 900, 90));
  const limit = col.limit || 16;
  const list = products.filter(
    (p) => (!col.cats || col.cats.includes(p.categoryKey)) && (!col.tag || p.tags.includes(col.tag)) && (!col.badge || p.badge === col.badge) && (!col.maxPrice || p.price <= col.maxPrice),
  );
  // Interleave categories so the edit feels mixed.
  const byCat = new Map();
  for (const p of list) byCat.set(p.categoryKey, [...(byCat.get(p.categoryKey) || []), p]);
  const queues = [...byCat.values()];
  const mixed = [];
  while (mixed.length < limit && queues.some((q) => q.length)) for (const q of queues) if (q.length && mixed.length < limit) mixed.push(q.shift());
  if (!mixed.length) fail(`collection ${col.slug} matched no products.`);
  collections.push({ slug: col.slug, name: col.name, description: col.description, imageUrl, productSlugs: mixed.map((p) => p.slug) });
}
// Remove artwork this script generated before but no longer does (hand-made SVGs are left alone).
for (const f of readdirSync(OUT_ART)) if (/^(hero|cat|col|dept)-.*\.webp$/.test(f) && !artFiles.has(f)) rmSync(join(OUT_ART, f));

// ── Module and attributions ──────────────────────────────────────────────────
const header = `// GENERATED by scripts/demo-catalog/build.mjs from scripts/demo-catalog/spec.mjs. Do not edit by hand:
// change the spec and run the script (see README → Demo catalog).
// Photos: seller listings on desertcart.in (demo only, to be replaced) and Magento Luma sample data (OSL 3.0).
// See public/image/ATTRIBUTIONS.md.
`;
writeFileSync(
  OUT_MODULE,
  `${header}export const DEMO_PRODUCTS = ${JSON.stringify(products, null, 1)};\n\nexport const DEMO_COLLECTIONS = ${JSON.stringify(collections, null, 1)};\n\nexport const DEMO_CATEGORY_IMAGES = ${JSON.stringify(categoryImages, null, 1)};\n\nexport const DEMO_HERO_IMAGES = ${JSON.stringify(heroImages, null, 1)};\n\nexport const DEMO_DEPARTMENT_IMAGES = ${JSON.stringify(departmentImages, null, 1)};\n`,
);
const shotRows = planned
  .filter(({ variants }) => variants[0].shot)
  .map(({ product, variants }) => `| ${product.title} | ${variants.map((v) => `${v.name}: <${SHOT_LISTING_URL(v.listing)}>`).join("<br>")} |`);
for (const h of SPEC.HEROES) if (h.shot) shotRows.push(`| Home page slide (${h.name}) | <${SHOT_LISTING_URL(h.listing)}> |`);
writeFileSync(
  OUT_ATTRIBUTIONS,
  `# Photo attributions

The built-in demo catalog borrows product photography so the store looks complete for the presentation,
before the owner uploads his own photos from the admin dashboard.

> **Demo only.** The product-only photos of the jackets, sweatshirts, t-shirts, vests, tops, beanies and
> travel bags are other sellers' listing photos from desertcart.in. They belong to those sellers and brands
> and are used here as placeholders for the presentation only. Replace every one of them with the shop's own
> photos (Admin → Products) before the store sells for real.

| Source | Terms | Used for |
| --- | --- | --- |
| Seller listings on [desertcart.in](https://www.desertcart.in) (images served from m.media-amazon.com) | © the respective sellers and brands; placeholder for the demo only | Men's and women's jackets, sweatshirts and hoodies; men's t-shirts and vests; women's tops; beanies; trolleys, duffles and holdalls |
| [magento/magento2-sample-data](https://github.com/magento/magento2-sample-data) (Luma sample catalog, \`pub/media/catalog/product\`) | Open Software License 3.0 | Men's track pants and shorts, women's leggings; backpacks, totes, messengers and duffles |
| The shop's own photo and footage (\`scripts/demo-catalog/source\`, \`scripts/hero-video/source\`) | © Al Habib Garments Mall | Home page: the winter slide and the bonfire video |

Each photo was saved into this repository at 900 × 1200 WebP, with a 450 × 600 copy (\`-sm.webp\`) for phones,
by \`scripts/demo-catalog/build.mjs\`; the site never loads images from the sources. Product-only photos were
trimmed and centred on a white card. Product names, descriptions and colour names are our own. None of the
photos are needed once the store has its own products.

## Borrowed photos to replace

| Product | Source listing per colour |
| --- | --- |
${shotRows.join("\n")}
`,
);

const dirSize = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? dirSize(join(dir, e.name)) : statSync(join(dir, e.name)).size), 0);
console.log(`products: ${products.length}, product images: ${written} (${(dirSize(OUT_PRODUCTS) / 1048576).toFixed(1)} MB), artwork: ${artFiles.size}`);
console.log(`collections: ${collections.map((c) => `${c.slug} (${c.productSlugs.length})`).join(", ")}`);
