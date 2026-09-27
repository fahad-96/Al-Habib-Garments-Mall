// Runs supabase/schema.sql inside an in-process Postgres (PGlite) with stubbed auth/storage
// schemas and exercises the security policies and the order, coupon, tracking and stock
// functions as the anonymous, admin and non-admin roles.
//
//   npm run test:db

import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { PRODUCTS, CATEGORIES, BANNERS, BRAND_FILM, productToRow, categoryToRow, bannerToRow, mapBannerRow } from "../src/data/catalog.js";

const db = new PGlite();
let pass = 0, fail = 0;
const ok = (cond, name, extra = "") => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { fail++; console.log(`  ✗ ${name} ${extra}`); } };
const expectError = async (fn, name, needle = "") => {
  try { await fn(); ok(false, name, "(no error thrown)"); }
  catch (e) { ok(!needle || String(e.message).includes(needle), name, `(got: ${e.message})`); }
};
const q = async (sql, params) => (await db.query(sql, params)).rows;

// ── Simulate the Supabase environment ──
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth; create schema storage;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text);
  create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
  grant usage on schema auth to anon, authenticated; grant execute on function auth.jwt() to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;
`);
const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
await db.exec(schema);
console.log("schema.sql ran cleanly");
// re-run to prove idempotency
await db.exec(schema);
console.log("schema.sql re-ran cleanly (idempotent)");

// ── Seed: admin user, categories, products ──
await db.exec(`insert into public.admin_users (email) values ('admin@test.com') on conflict do nothing;`);
await db.exec(`insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'admin@test.com');`);
for (const c of CATEGORIES) {
  const r = categoryToRow(c);
  await db.query(`insert into public.categories (key, department, slug, name, size_set, description, image_url, sort_order, is_active) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [r.key, r.department, r.slug, r.name, r.size_set, r.description, r.image_url, r.sort_order, r.is_active]);
}
for (const p of PRODUCTS) {
  const r = productToRow(p);
  await db.query(`insert into public.products (slug, title, brand, department, category_key, badge, short_info, description, details, mrp, price, size_set, sizes, variants, tags, sort_order, is_active) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
    [r.slug, r.title, r.brand, r.department, r.category_key, r.badge, r.short_info, r.description, JSON.stringify(r.details), r.mrp, r.price, r.size_set, JSON.stringify(r.sizes), JSON.stringify(r.variants), r.tags, r.sort_order, r.is_active]);
}
// Pick test fixtures from the seeded data rather than hard-coding slugs.
const INACTIVE_SLUG = PRODUCTS[PRODUCTS.length - 1].slug;
await db.exec(`update public.products set is_active = false where slug = '${INACTIVE_SLUG}'`);
const findVariantWithStock = (min) => { for (const p of PRODUCTS) { if (p.slug === INACTIVE_SLUG) continue; for (const v of p.variants) for (const [size, n] of Object.entries(v.stock)) if (n >= min) return { p, v, size, n }; } return null; };
const findZeroStock = () => { for (const p of PRODUCTS) { if (p.slug === INACTIVE_SLUG) continue; for (const v of p.variants) for (const [size, n] of Object.entries(v.stock)) if (n === 0) return { p, v, size }; } return null; };
const MAIN = findVariantWithStock(3);
const ZERO = findZeroStock();
const SECOND = PRODUCTS.find((p) => p.slug !== MAIN.p.slug && p.slug !== INACTIVE_SLUG && p.price < 1500 && p.variants.some((v) => Object.values(v.stock).some((n) => n >= 1)));
const SECOND_V = SECOND.variants.find((v) => Object.values(v.stock).some((n) => n >= 1));
const SECOND_SIZE = Object.entries(SECOND_V.stock).find(([, n]) => n >= 1)[0];
console.log(`seeded ${CATEGORIES.length} categories, ${PRODUCTS.length} products`);

const asAnon = async (fn) => { await db.exec(`set role anon; select set_config('request.jwt.claims', '', false);`); try { return await fn(); } finally { await db.exec(`reset role;`); } };
const asAdmin = async (fn) => { await db.exec(`set role authenticated; select set_config('request.jwt.claims', '{"email":"admin@test.com","sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', false);`); try { return await fn(); } finally { await db.exec(`reset role;`); } };
const asStranger = async (fn) => { await db.exec(`set role authenticated; select set_config('request.jwt.claims', '{"email":"stranger@test.com","sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', false);`); try { return await fn(); } finally { await db.exec(`reset role;`); } };

console.log("\n[RLS: catalog]");
await asAnon(async () => {
  const rows = await q(`select slug, is_active from public.products`);
  ok(rows.length === PRODUCTS.length - 1 && rows.every((r) => r.is_active), "anon sees only active products");
  await expectError(() => q(`insert into public.products (slug, title, category_key) values ('hack', 'Hack', 'men-kurtas')`), "anon cannot insert products", "row-level security");
  await q(`update public.products set price = 1 where slug = $1`, [MAIN.p.slug]);
  ok((await q(`select price from public.products where slug = $1`, [MAIN.p.slug]))[0].price !== 1, "anon update affects zero rows (RLS)");
  ok((await q(`select * from public.coupons`)).length === 0, "anon sees no coupons");
  ok((await q(`select * from public.orders`)).length === 0, "anon sees no orders");
  ok((await q(`select * from public.store_settings`)).length === 1, "anon reads settings");
  ok((await q(`select public.is_admin_user() as a`))[0].a === false, "anon is not admin");
  await expectError(() => q(`select public.adjust_variant_stock((select id from public.products limit 1), 'Black', 'M', -1)`), "anon cannot call adjust_variant_stock", "permission denied");
  ok((await q(`select * from public.admin_users`).catch(() => "denied")) === "denied" || (await q(`select * from public.admin_users`)).length === 0, "anon cannot read admin_users");
});
await asAdmin(async () => {
  ok((await q(`select public.is_admin_user() as a`))[0].a === true, "admin recognised");
  ok((await q(`select slug from public.products`)).length === PRODUCTS.length, "admin sees inactive products too");
  const upd = await q(`update public.products set badge = 'Bestseller' where slug = $1 returning badge`, [MAIN.p.slug]);
  ok(upd.length === 1, "admin can update products");
  const video = { ...BANNERS[0], id: undefined, ...BRAND_FILM };
  const row = bannerToRow(video);
  const cols = Object.keys(row);
  const saved = await q(`insert into public.banners (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")}) returning *`, Object.values(row));
  const back = mapBannerRow(saved[0]);
  ok(back.videoUrl === video.videoUrl && back.videoUrlPortrait === video.videoUrlPortrait && back.imageUrlPortrait === video.imageUrlPortrait, "hero video banner round-trips through the banners table");
  await q(`delete from public.banners where id = $1`, [saved[0].id]);
});
await asStranger(async () => {
  ok((await q(`select public.is_admin_user() as a`))[0].a === false, "non-listed authenticated user is not admin");
  await q(`update public.products set price = 1 where slug = $1`, [MAIN.p.slug]);
  ok((await q(`select price from public.products where slug = $1`, [MAIN.p.slug]))[0].price !== 1, "non-listed user update affects zero rows (RLS)");
});

console.log("\n[Coupons]");
await asAdmin(async () => {
  await q(`insert into public.coupons (code, type, value, min_order, max_discount) values ('WELCOME10', 'percent', 10, 1000, 500)`);
  await q(`insert into public.coupons (code, type, value, min_order, usage_limit) values ('FLAT200', 'flat', 200, 0, 1)`);
  await q(`insert into public.coupons (code, type, value, expires_at) values ('OLD', 'percent', 50, now() - interval '1 day')`);
  await q(`insert into public.coupons (code, type, value, is_active) values ('OFF', 'percent', 50, false)`);
});
await asAnon(async () => {
  const v = (sql) => q(sql).then((r) => r[0].v);
  let r = await v(`select public.validate_coupon('welcome10', 2500) as v`);
  ok(r.valid === true && r.discount === 250, "percent coupon 10% of 2500 = 250", JSON.stringify(r));
  r = await v(`select public.validate_coupon('WELCOME10', 9000) as v`);
  ok(r.valid === true && r.discount === 500, "percent coupon capped at max_discount", JSON.stringify(r));
  r = await v(`select public.validate_coupon('WELCOME10', 800) as v`);
  ok(r.valid === false && /Add items worth/.test(r.message), "below min order rejected", JSON.stringify(r));
  r = await v(`select public.validate_coupon('OLD', 2000) as v`);
  ok(r.valid === false && /expired/.test(r.message), "expired rejected", JSON.stringify(r));
  r = await v(`select public.validate_coupon('OFF', 2000) as v`);
  ok(r.valid === false && /no longer active/.test(r.message), "inactive rejected", JSON.stringify(r));
  r = await v(`select public.validate_coupon('NOPE', 2000) as v`);
  ok(r.valid === false && /not found/.test(r.message), "unknown rejected", JSON.stringify(r));
  r = await v(`select public.validate_coupon('FLAT200', 150) as v`);
  ok(r.valid === true && r.discount === 150, "flat coupon capped at subtotal", JSON.stringify(r));
});

console.log("\n[place_order]");
const pheran = (await q(`select id, price, variants from public.products where slug = $1`, [MAIN.p.slug]))[0];
const jeans = (await q(`select id, price from public.products where slug = $1`, [SECOND.slug]))[0];
const inactive = (await q(`select id from public.products where slug = $1`, [INACTIVE_SLUG]))[0];
const kurta = (await q(`select id, variants from public.products where slug = $1`, [ZERO.p.slug]))[0];
const MAIN_COLOR = MAIN.v.color, MAIN_SIZE = MAIN.size, ZERO_COLOR = ZERO.v.color, ZERO_SIZE = ZERO.size, SECOND_COLOR = SECOND_V.color;
console.log(`  main: ${MAIN.p.slug} ${MAIN_COLOR}/${MAIN_SIZE} stock ${MAIN.n}; second: ${SECOND.slug} ${SECOND_COLOR}/${SECOND_SIZE}; zero: ${ZERO.p.slug} ${ZERO_COLOR}/${ZERO_SIZE}; inactive: ${INACTIVE_SLUG}`);
const charcoalStock = pheran.variants.find((v) => v.color === MAIN_COLOR).stock;
const customer = { name: "Aabid Mir", phone: "+91 98765 43210", address: "Near Jamia Masjid, Kunzer", city: "Tangmarg", pincode: "193404", note: "Call before delivery" };
const placed = await asAnon(async () => {
  const r = await q(`select public.place_order($1::jsonb, $2::jsonb, $3) as v`, [JSON.stringify(customer), JSON.stringify([{ product_id: pheran.id, color: MAIN_COLOR, size: MAIN_SIZE, qty: 2 }, { product_id: jeans.id, color: SECOND_COLOR, size: SECOND_SIZE, qty: 1 }]), "welcome10"]);
  return r[0].v;
});
console.log(`  placed: ${placed.order_number} subtotal ${placed.subtotal} discount ${placed.discount} fee ${placed.delivery_fee} total ${placed.total}`);
const expectedSubtotal = pheran.price * 2 + jeans.price;
ok(placed.order_number?.startsWith("AHG-0"), "order number format AHG-0xxxx");
ok(placed.subtotal === expectedSubtotal, "subtotal uses DB prices", `${placed.subtotal} vs ${expectedSubtotal}`);
ok(placed.discount === Math.min(500, Math.floor(expectedSubtotal * 0.1)), "coupon discount applied");
ok(placed.delivery_fee === 0, "free delivery over threshold");
ok(placed.total === placed.subtotal - placed.discount + placed.delivery_fee, "total adds up");
ok(placed.items.length === 2 && placed.items[0].image.includes("/image/products/"), "items snapshot with images");
const stored = (await q(`select * from public.orders where order_number = $1`, [placed.order_number]))[0];
ok(stored.phone === "9876543210", "phone normalised to 10 digits", stored.phone);
ok(stored.coupon_code === "WELCOME10", "coupon code stored uppercase");
ok(stored.status === "new" && stored.stock_applied === false, "new order, stock not yet applied");
ok((await q(`select used_count from public.coupons where code = 'WELCOME10'`))[0].used_count === 1, "coupon used_count incremented");
const stockAfterPlace = (await q(`select variants from public.products where id = $1`, [pheran.id]))[0].variants.find((v) => v.color === MAIN_COLOR).stock[MAIN_SIZE];
ok(stockAfterPlace === charcoalStock[MAIN_SIZE], "stock unchanged at placement");

await asAnon(async () => {
  const small = await q(`select public.place_order($1::jsonb, $2::jsonb, null) as v`, [JSON.stringify(customer), JSON.stringify([{ product_id: jeans.id, color: SECOND_COLOR, size: SECOND_SIZE, qty: 1 }])]);
  ok(small[0].v.delivery_fee === 99 && small[0].v.total === jeans.price + 99, "delivery fee charged under threshold", JSON.stringify(small[0].v));
  await expectError(() => q(`select public.place_order($1::jsonb, $2::jsonb, null)`, [JSON.stringify({ ...customer, phone: "12345" }), JSON.stringify([{ product_id: jeans.id, color: SECOND_COLOR, size: SECOND_SIZE, qty: 1 }])]), "invalid phone rejected", "valid 10-digit");
  await expectError(() => q(`select public.place_order($1::jsonb, $2::jsonb, null)`, [JSON.stringify({ ...customer, name: "A" }), JSON.stringify([{ product_id: jeans.id, color: SECOND_COLOR, size: SECOND_SIZE, qty: 1 }])]), "short name rejected", "your name");
  await expectError(() => q(`select public.place_order($1::jsonb, $2::jsonb, null)`, [JSON.stringify(customer), JSON.stringify([])]), "empty bag rejected", "empty");
  await expectError(() => q(`select public.place_order($1::jsonb, $2::jsonb, null)`, [JSON.stringify(customer), JSON.stringify([{ product_id: pheran.id, color: MAIN_COLOR, size: MAIN_SIZE, qty: 99 }])]), "qty > 10 rejected", "between 1 and 10");
  await expectError(() => q(`select public.place_order($1::jsonb, $2::jsonb, null)`, [JSON.stringify(customer), JSON.stringify([{ product_id: kurta.id, color: ZERO_COLOR, size: ZERO_SIZE, qty: 1 }])]), "size with no stock rejected", "Only 0 left");
  await expectError(() => q(`select public.place_order($1::jsonb, $2::jsonb, null)`, [JSON.stringify(customer), JSON.stringify([{ product_id: pheran.id, color: "Not-a-colour", size: MAIN_SIZE, qty: 1 }])]), "unknown colour rejected", "not available in Not-a-colour");
  await expectError(() => q(`select public.place_order($1::jsonb, $2::jsonb, null)`, [JSON.stringify(customer), JSON.stringify([{ product_id: inactive.id, color: MAIN_COLOR, size: MAIN_SIZE, qty: 1 }])]), "inactive product rejected", "no longer available");
  await expectError(() => q(`select public.place_order($1::jsonb, $2::jsonb, null)`, [JSON.stringify(customer), JSON.stringify([{ product_id: "not-a-uuid", color: MAIN_COLOR, size: MAIN_SIZE, qty: 1 }])]), "bad product id rejected", "invalid");
  await expectError(() => q(`select public.place_order($1::jsonb, $2::jsonb, null)`, [JSON.stringify({ ...customer, pincode: "12" }), JSON.stringify([{ product_id: jeans.id, color: SECOND_COLOR, size: SECOND_SIZE, qty: 1 }])]), "bad pincode rejected", "PIN");
  const okPhone = await q(`select public.place_order($1::jsonb, $2::jsonb, null) as v`, [JSON.stringify({ ...customer, phone: "09876543210", pincode: "" }), JSON.stringify([{ product_id: jeans.id, color: SECOND_COLOR, size: SECOND_SIZE, qty: 1 }])]);
  ok(Boolean(okPhone[0].v.order_number), "leading-zero phone and empty pincode accepted");
  const badCoupon = await q(`select public.place_order($1::jsonb, $2::jsonb, 'NOPE') as v`, [JSON.stringify(customer), JSON.stringify([{ product_id: jeans.id, color: SECOND_COLOR, size: SECOND_SIZE, qty: 1 }])]);
  ok(badCoupon[0].v.discount === 0, "invalid coupon silently ignored at placement");
});

console.log("\n[track_order]");
await asAnon(async () => {
  const t = (await q(`select public.track_order($1, $2) as v`, [placed.order_number.toLowerCase(), "98765 43210"]))[0].v;
  ok(t && t.order_number === placed.order_number && t.status === "new" && Array.isArray(t.items), "track with number + phone works");
  ok(t && !("phone" in t) && !("address" in t), "track result omits phone/address");
  const wrong = (await q(`select public.track_order($1, $2) as v`, [placed.order_number, "9999999999"]))[0].v;
  ok(wrong === null, "wrong phone returns null");
  const short = (await q(`select public.track_order($1, $2) as v`, [placed.order_number, "3210"]))[0].v;
  ok(short === null, "short phone fragment returns null");
});

console.log("\n[set_order_status + stock]");
await asAnon(async () => {
  await expectError(() => q(`select public.set_order_status($1, 'confirmed')`, [stored.id]), "anon cannot set status", "permission denied");
});
await asStranger(async () => {
  await expectError(() => q(`select public.set_order_status($1, 'confirmed')`, [stored.id]), "non-admin cannot set status", "Not allowed");
});
await asAdmin(async () => {
  const stockOf = async () => (await q(`select variants from public.products where id = $1`, [pheran.id]))[0].variants.find((v) => v.color === MAIN_COLOR).stock[MAIN_SIZE];
  const before = await stockOf();
  let o = (await q(`select * from public.set_order_status($1, 'confirmed')`, [stored.id]))[0];
  ok(o.status === "confirmed" && o.stock_applied === true, "confirmed + stock_applied");
  ok((await stockOf()) === before - 2, "stock reduced by qty on confirm", `${await stockOf()} vs ${before - 2}`);
  ok(o.status_history.length === 2 && o.status_history[1].status === "confirmed", "status history appended");
  o = (await q(`select * from public.set_order_status($1, 'packed')`, [stored.id]))[0];
  ok((await stockOf()) === before - 2, "stock not double-deducted on packed");
  o = (await q(`select * from public.set_order_status($1, 'cancelled')`, [stored.id]))[0];
  ok(o.status === "cancelled" && o.stock_applied === false && (await stockOf()) === before, "cancel restores stock");
  o = (await q(`select (public.set_order_status($1, 'confirmed')).*`, [stored.id]))[0];
  ok((await stockOf()) === before - 2, "re-confirm deducts again");
  o = (await q(`select * from public.set_order_status($1, 'new')`, [stored.id]))[0];
  ok((await stockOf()) === before && o.stock_applied === false, "back to new releases stock");
  await expectError(() => q(`select public.set_order_status($1, 'bogus')`, [stored.id]), "unknown status rejected", "Unknown status");
  await expectError(() => q(`select public.set_order_status('00000000-0000-0000-0000-000000000000', 'confirmed')`), "missing order rejected", "not found");
  const note = await q(`update public.orders set admin_note = 'Pack with care' where id = $1 returning admin_note`, [stored.id]);
  ok(note[0].admin_note === "Pack with care", "admin can update note");
  ok((await q(`select count(*)::int as c from public.orders`))[0].c >= 4, "admin can list orders");
});

console.log("\n[Reviews]");
await asAnon(async () => {
  await q(`insert into public.reviews (product_id, product_slug, name, rating, title, body) values ($1, $2, 'Sana', 5, 'Warm', 'Lovely wool')`, [pheran.id, MAIN.p.slug]);
  ok(true, "anon can submit a review (unapproved)");
  await expectError(() => q(`insert into public.reviews (product_id, product_slug, name, rating, is_approved) values ($1, $2, 'Sana', 5, true)`, [pheran.id, MAIN.p.slug]), "anon cannot self-approve", "row-level security");
  await expectError(() => q(`insert into public.reviews (product_id, product_slug, name, rating) values ($1, $2, 'Sana', 9)`, [pheran.id, MAIN.p.slug]), "rating > 5 rejected", "check");
  ok((await q(`select * from public.reviews`)).length === 0, "anon sees no unapproved reviews");
  ok((await q(`select * from public.product_ratings`)).length === 0, "ratings view empty before approval");
});
await asAdmin(async () => {
  ok((await q(`select * from public.reviews`)).length === 1, "admin sees pending review");
  await q(`update public.reviews set is_approved = true`);
});
await asAnon(async () => {
  ok((await q(`select * from public.reviews`)).length === 1, "anon sees approved review");
  const r = await q(`select * from public.product_ratings`);
  ok(r.length === 1 && Number(r[0].average) === 5 && r[0].count === 1, "ratings view aggregates approved", JSON.stringify(r));
});

console.log("\n[Categories restrict]");
await asAdmin(async () => {
  await expectError(() => q(`delete from public.categories where key = $1`, [MAIN.p.categoryKey]), "category with products cannot be deleted", "foreign key");
  await q(`insert into public.categories (key, department, slug, name) values ('men-temp', 'men', 'temp', 'Temp')`);
  await q(`delete from public.categories where key = 'men-temp'`);
  ok(true, "empty category can be deleted");
});

console.log(`\n${pass} passed, ${fail} failed`);
await db.close();
process.exit(fail ? 1 : 0);
