// Builds the built-in demo catalog from open-source product photography:
//   - reads product photos and metadata from the Magento sample data CSV fixtures and the Sylius cap fixtures,
//   - applies the copy, colours and mappings in ./spec.mjs,
//   - writes every product photo as <name>.webp (900 × 1200) and <name>-sm.webp (450 × 600) under public/image/products,
//   - composes the hero, category and collection artwork in public/image/art,
//   - writes src/data/demo-products.js and public/image/ATTRIBUTIONS.md.
//
// Usage (see README → Demo catalog):
//   npm i --no-save sharp
//   MAGENTO_SAMPLE_DIR=/path/to/magento2-sample-data SYLIUS_DIR=/path/to/Sylius node scripts/demo-catalog/build.mjs
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as SPEC from "./spec.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MAGENTO_DIR = resolve(process.env.MAGENTO_SAMPLE_DIR || "/home/user/magento/sample");
const SYLIUS_DIR = resolve(process.env.SYLIUS_DIR || "/home/user/sylius/Sylius");

const MAGENTO_MEDIA = join(MAGENTO_DIR, "pub/media/catalog/product");
const MAGENTO_APPAREL_CSV = join(MAGENTO_DIR, "app/code/Magento/ConfigurableSampleData/fixtures/products.csv");
const MAGENTO_BAGS_CSV = join(MAGENTO_DIR, "app/code/Magento/CatalogSampleData/fixtures/SimpleProduct/products_gear_bags.csv");
const MAGENTO_BAG_IMAGES_CSV = join(MAGENTO_DIR, "app/code/Magento/CatalogSampleData/fixtures/SimpleProduct/images_gear_bags.csv");
const SYLIUS_CAPS = join(SYLIUS_DIR, "src/Sylius/Bundle/CoreBundle/Resources/fixtures/caps");

const OUT_PRODUCTS = join(ROOT, "public/image/products");
const OUT_ART = join(ROOT, "public/image/art");
const OUT_MODULE = join(ROOT, "src/data/demo-products.js");
const OUT_ATTRIBUTIONS = join(ROOT, "public/image/ATTRIBUTIONS.md");

const IMAGE = { width: 900, height: 1200, quality: 80 };
const IMAGE_SM = { width: 450, height: 600, quality: 78 };

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
requireSource(SYLIUS_CAPS, "Sylius cap fixtures", "SYLIUS_DIR");

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

for (const a of SPEC.APPAREL) {
  const m = MAGENTO.get(a.sku);
  if (!m) fail(`no Magento product ${a.sku} in ${MAGENTO_APPAREL_CSV}.`);
  const skip = new Set(a.skip || []);
  const variants = m.variants
    .filter((v) => !(a.omit || []).includes(v.color))
    .map((v) => ({ ...colourOf(a.colors?.[v.color] ?? SPEC.COLOR_RENAME[v.color] ?? v.color, a.sku), files: v.images.filter((f) => !skip.has(stem(f))), ref: `${a.sku}/${v.color}` }))
    .filter((v) => v.files.length)
    .sort((x, y) => y.files.length - x.files.length); // the colour with the full photo set leads
  plan({ ...a, key: a.sku, variants });
}
for (const b of SPEC.BAGS) {
  if (!BAG_SOURCES.skus.has(b.sku)) fail(`no Magento bag ${b.sku} in ${MAGENTO_BAGS_CSV}.`);
  const photos = BAG_SOURCES.images.get(b.sku) || {};
  const variants = Object.entries(b.colors).map(([token, value]) => {
    if (!photos[token]?.length) fail(`${b.sku}: no "${token}" photo in ${MAGENTO_BAG_IMAGES_CSV}.`);
    return { ...colourOf(value, b.sku), files: photos[token], ref: `${b.sku}/${token}` };
  });
  plan({ ...b, key: b.sku, variants });
}
for (const c of SPEC.CAPS) {
  const files = c.files.map((f) => join(SYLIUS_CAPS, f));
  const missing = files.find((f) => !existsSync(f));
  if (missing) fail(`${c.id}: missing ${missing}.`);
  const colour = colourOf(c.color, c.id);
  plan({ ...c, key: c.id, variants: [{ ...colour, files, ref: `${c.id}/${colour.name}` }] });
}

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
const photoIndex = {}; // "SKU/source colour" -> source file of the colour's first photo
let written = 0;
for (const { variants, product } of planned) {
  const dir = join(OUT_PRODUCTS, product.slug);
  mkdirSync(dir, { recursive: true });
  for (let vi = 0; vi < variants.length; vi++) {
    const v = variants[vi];
    for (let i = 0; i < v.files.length; i++) {
      const name = `${colorSlug(v.name)}-${i + 1}`;
      await writeProductImage(v.files[i], dir, name);
      product.variants[vi].images.push(`/image/products/${product.slug}/${name}.webp`);
      written += 2;
    }
    photoIndex[v.ref] = v.files[0];
  }
}
const products = planned.map((p) => p.product);

// ── Artwork ──────────────────────────────────────────────────────────────────
const srcOf = (ref) => photoIndex[ref] || fail(`no photo for ${ref} (use "SKU/Magento colour", e.g. "MS01/Black").`);
const backgroundOf = async (file) => {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const i = (4 * info.width + 4) * info.channels;
  return `#${[data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
// The photo sits on the right on a canvas of its own background colour, leaving room for copy on the left.
const compose = async (src, dest, W, H, right) => {
  const photo = await sharp(src).resize({ height: H }).toBuffer();
  const { width } = await sharp(photo).metadata();
  await sharp({ create: { width: W, height: H, channels: 3, background: await backgroundOf(src) } })
    .composite([{ input: photo, left: Math.max(0, W - width - right), top: 0 }])
    .webp({ quality: 82 })
    .toFile(dest);
};

mkdirSync(OUT_ART, { recursive: true });
const artFiles = new Set();
for (const h of SPEC.HEROES) {
  await compose(srcOf(h.photo), join(OUT_ART, `${h.name}.webp`), 1800, 1100, 140);
  artFiles.add(`${h.name}.webp`);
}
const categoryImages = {};
for (const c of SPEC.CATEGORIES) {
  if (!c.image) continue;
  const file = `cat-${c.key}.webp`;
  await sharp(srcOf(c.image)).resize(800, 1000, { fit: "cover", position: "top" }).webp({ quality: 80 }).toFile(join(OUT_ART, file));
  categoryImages[c.key] = `/image/art/${file}`;
  artFiles.add(file);
}
const collections = [];
for (const col of SPEC.COLLECTIONS) {
  const file = `col-${col.slug}.webp`;
  await compose(srcOf(col.photo), join(OUT_ART, file), 1200, 900, 90);
  artFiles.add(file);
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
  collections.push({ slug: col.slug, name: col.name, description: col.description, imageUrl: `/image/art/${file}`, productSlugs: mixed.map((p) => p.slug) });
}
// Remove artwork this script generated before but no longer does (hand-made SVGs are left alone).
for (const f of readdirSync(OUT_ART)) if (/^(hero|cat|col)-.*\.webp$/.test(f) && !artFiles.has(f)) rmSync(join(OUT_ART, f));

// ── Module and attributions ──────────────────────────────────────────────────
const header = `// GENERATED by scripts/demo-catalog/build.mjs from scripts/demo-catalog/spec.mjs. Do not edit by hand:
// change the spec and run the script (see README → Demo catalog).
// Photos: Magento Luma sample data (OSL 3.0) and Sylius fixtures (MIT). See public/image/ATTRIBUTIONS.md.
`;
writeFileSync(
  OUT_MODULE,
  `${header}export const DEMO_PRODUCTS = ${JSON.stringify(products, null, 1)};\n\nexport const DEMO_COLLECTIONS = ${JSON.stringify(collections, null, 1)};\n\nexport const DEMO_CATEGORY_IMAGES = ${JSON.stringify(categoryImages, null, 1)};\n`,
);
writeFileSync(
  OUT_ATTRIBUTIONS,
  `# Photo attributions

The built-in demo catalog uses open-source product photography so the store looks complete before
the owner uploads their own photos from the admin dashboard.

| Source | License | Used for |
| --- | --- | --- |
| [magento/magento2-sample-data](https://github.com/magento/magento2-sample-data) (Luma sample catalog, \`pub/media/catalog/product\`) | Open Software License 3.0 | Men's and women's jackets, hoodies, tees, track pants, shorts, vests; bags |
| [Sylius/Sylius](https://github.com/Sylius/Sylius) (\`src/Sylius/Bundle/CoreBundle/Resources/fixtures/caps\`) | MIT | Beanies |

Each photo was resized to 900 × 1200 WebP, with a 450 × 600 copy (\`-sm.webp\`) for phones, by
\`scripts/demo-catalog/build.mjs\`. Product names, descriptions and colour names are our own. Replace
the photos with your own from Admin → Products; none of them are needed once the store has its own products.
`,
);

const dirSize = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? dirSize(join(dir, e.name)) : statSync(join(dir, e.name)).size), 0);
console.log(`products: ${products.length}, product images: ${written} (${(dirSize(OUT_PRODUCTS) / 1048576).toFixed(1)} MB), artwork: ${artFiles.size}`);
console.log(`collections: ${collections.map((c) => `${c.slug} (${c.productSlugs.length})`).join(", ")}`);
