// Admin data access. Every call here is also enforced server-side by Supabase
// Row Level Security (see supabase/schema.sql). The client checks are UX only.
import {
  bannerToRow, categoryToRow, collectionToRow, couponToRow, mapBannerRow, mapCategoryRow, mapCollectionRow, mapCouponRow,
  mapOrderRow, mapProductRow, mapReviewRow, mapSettingsRow, mapSizeGuideRow, productToRow, settingsToRow, sizeGuideToRow,
} from "../data/catalog";
import { explainDbError } from "./supabaseClient";

const run = async (promise) => {
  const { data, error } = await promise;
  if (error) throw new Error(explainDbError(error));
  return data;
};

const sanitizeTerm = (s) => String(s || "").trim().replace(/[,()."\\%]/g, " ").replace(/\s+/g, " ").slice(0, 80).trim();

export const isAdminUser = async (supabase) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session?.user) return false;
  const { data, error } = await supabase.rpc("is_admin_user");
  if (error) throw error;
  return Boolean(data);
};

const requireUser = async (supabase) => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const user = data.session?.user;
  if (!user) throw new Error("Admin session not found. Please sign in again.");
  return user;
};

// ── Products ───────────────────────────────────────────────────────────────
export const fetchAdminProducts = async (supabase, filters = {}) => {
  let q = supabase.from("products").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (filters.status === "active") q = q.eq("is_active", true);
  if (filters.status === "inactive") q = q.eq("is_active", false);
  if (filters.department) q = q.eq("department", filters.department);
  if (filters.categoryKey) q = q.eq("category_key", filters.categoryKey);
  const term = sanitizeTerm(filters.search);
  if (term) q = q.or(`title.ilike.%${term}%,slug.ilike.%${term}%,brand.ilike.%${term}%`);
  return (await run(q)).map(mapProductRow);
};

export const saveProduct = async (supabase, product) => {
  const user = await requireUser(supabase);
  const row = { ...productToRow(product), updated_by: user.id };
  if (!row.id) row.created_by = user.id;
  const data = await run(supabase.from("products").upsert(row, { onConflict: row.id ? "id" : "slug" }).select("*").single());
  return mapProductRow(data);
};

export const deleteProduct = async (supabase, id) => {
  await run(supabase.from("products").delete().eq("id", id));
  return true;
};

export const bulkSetProductsActive = async (supabase, ids, isActive) => {
  if (!ids?.length) return [];
  return run(supabase.from("products").update({ is_active: isActive }).in("id", ids).select("id"));
};

export const bulkDeleteProducts = async (supabase, ids) => {
  if (!ids?.length) return [];
  return run(supabase.from("products").delete().in("id", ids).select("id"));
};

// ── Generic tables (categories, banners, collections, coupons, size_guides) ──
const TABLES = {
  categories: { map: mapCategoryRow, toRow: categoryToRow, conflict: "key", order: "sort_order" },
  banners: { map: mapBannerRow, toRow: bannerToRow, conflict: "id", order: "sort_order" },
  collections: { map: mapCollectionRow, toRow: collectionToRow, conflict: "id", order: "sort_order" },
  coupons: { map: mapCouponRow, toRow: couponToRow, conflict: "id", order: "created_at" },
  size_guides: { map: mapSizeGuideRow, toRow: sizeGuideToRow, conflict: "id", order: "slug" },
};

export const fetchTable = async (supabase, table) => {
  const t = TABLES[table];
  if (!t) throw new Error(`Unknown table ${table}`);
  const data = await run(supabase.from(table).select("*").order(t.order, { ascending: table !== "coupons" }));
  return (data || []).map(t.map);
};

export const saveRow = async (supabase, table, item) => {
  const t = TABLES[table];
  if (!t) throw new Error(`Unknown table ${table}`);
  const row = t.toRow(item);
  const conflict = t.conflict === "id" && !row.id ? undefined : t.conflict;
  const data = await run(supabase.from(table).upsert(row, conflict ? { onConflict: conflict } : undefined).select("*").single());
  return t.map(data);
};

export const deleteRow = async (supabase, table, idOrKey) => {
  const t = TABLES[table];
  if (!t) throw new Error(`Unknown table ${table}`);
  await run(supabase.from(table).delete().eq(t.conflict === "key" ? "key" : "id", idOrKey));
  return true;
};

// ── Orders ─────────────────────────────────────────────────────────────────
export const fetchOrders = async (supabase, filters = {}) => {
  let q = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(filters.limit || 300);
  if (filters.status && filters.status !== "all") q = q.eq("status", filters.status);
  const term = sanitizeTerm(filters.search);
  if (term) q = q.or(`order_number.ilike.%${term}%,customer_name.ilike.%${term}%,phone.ilike.%${term}%`);
  return (await run(q)).map(mapOrderRow);
};

export const fetchOrder = async (supabase, id) => mapOrderRow(await run(supabase.from("orders").select("*").eq("id", id).single()));

export const setOrderStatus = async (supabase, id, status) => {
  const data = await run(supabase.rpc("set_order_status", { p_order_id: id, p_status: status }));
  return mapOrderRow(data);
};

export const saveOrderNote = async (supabase, id, note) => {
  const data = await run(supabase.from("orders").update({ admin_note: String(note || "").slice(0, 2000) }).eq("id", id).select("*").single());
  return mapOrderRow(data);
};

export const deleteOrder = async (supabase, id) => {
  await run(supabase.from("orders").delete().eq("id", id));
  return true;
};

// ── Reviews ────────────────────────────────────────────────────────────────
export const fetchAdminReviews = async (supabase, filters = {}) => {
  let q = supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(500);
  if (filters.status === "pending") q = q.eq("is_approved", false);
  if (filters.status === "approved") q = q.eq("is_approved", true);
  return (await run(q)).map(mapReviewRow);
};

export const setReviewApproved = async (supabase, id, isApproved) => {
  const data = await run(supabase.from("reviews").update({ is_approved: isApproved }).eq("id", id).select("*").single());
  return mapReviewRow(data);
};

export const deleteReview = async (supabase, id) => {
  await run(supabase.from("reviews").delete().eq("id", id));
  return true;
};

// ── Settings ───────────────────────────────────────────────────────────────
export const fetchSettings = async (supabase) => mapSettingsRow(await run(supabase.from("store_settings").select("*").eq("id", 1).maybeSingle()));

export const saveSettings = async (supabase, settings) => {
  const data = await run(supabase.from("store_settings").upsert(settingsToRow(settings), { onConflict: "id" }).select("*").single());
  return mapSettingsRow(data);
};

// ── Dashboard ──────────────────────────────────────────────────────────────
export const fetchDashboard = async (supabase) => {
  const [products, orders, pendingReviews] = await Promise.all([
    run(supabase.from("products").select("id,title,slug,variants,is_active,price")),
    run(supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500)),
    run(supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false)),
  ]);
  return {
    products: (products || []).map(mapProductRow),
    orders: (orders || []).map(mapOrderRow),
    pendingReviews: pendingReviews === null ? 0 : Number(pendingReviews) || 0,
  };
};

// ── One-click import of the dummy catalog (skips rows that already exist) ──
export const seedDummyData = async (supabase, { products, categories, banners, collections, sizeGuides }, onProgress = () => {}) => {
  const user = await requireUser(supabase);
  const counts = { categories: 0, products: 0, banners: 0, collections: 0, sizeGuides: 0 };

  const existingCats = new Set(((await run(supabase.from("categories").select("key"))) || []).map((r) => r.key));
  for (const c of categories) {
    if (existingCats.has(c.key)) continue;
    const { error } = await supabase.from("categories").insert(categoryToRow(c));
    if (!error) counts.categories += 1;
  }
  onProgress(counts);

  const existingSlugs = new Set(((await run(supabase.from("products").select("slug"))) || []).map((r) => r.slug));
  for (const p of products) {
    if (existingSlugs.has(p.slug)) continue;
    const row = { ...productToRow({ ...p, id: null }), created_by: user.id, updated_by: user.id };
    const { error } = await supabase.from("products").insert(row);
    if (!error) counts.products += 1;
    onProgress(counts);
  }

  const existingBannerTitles = new Set(((await run(supabase.from("banners").select("title"))) || []).map((r) => r.title));
  for (const b of banners) {
    if (existingBannerTitles.has(b.title)) continue;
    const { error } = await supabase.from("banners").insert(bannerToRow({ ...b, id: null }));
    if (!error) counts.banners += 1;
  }

  const existingCols = new Set(((await run(supabase.from("collections").select("slug"))) || []).map((r) => r.slug));
  for (const c of collections) {
    if (existingCols.has(c.slug)) continue;
    const { error } = await supabase.from("collections").insert(collectionToRow({ ...c, id: null }));
    if (!error) counts.collections += 1;
  }

  const existingGuides = new Set(((await run(supabase.from("size_guides").select("slug"))) || []).map((r) => r.slug));
  for (const g of sizeGuides) {
    if (existingGuides.has(g.slug)) continue;
    const { error } = await supabase.from("size_guides").insert(sizeGuideToRow({ ...g, id: null }));
    if (!error) counts.sizeGuides += 1;
  }
  onProgress(counts);
  return counts;
};
