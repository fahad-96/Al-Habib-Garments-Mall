// Public (anon) data access for the storefront. Everything here is readable by
// anyone; writes go through SECURITY DEFINER functions defined in supabase/schema.sql.
import {
  mapBannerRow, mapCategoryRow, mapCollectionRow, mapProductRow, mapReviewRow, mapSettingsRow, mapSizeGuideRow,
} from "../data/catalog";

const ok = (res) => {
  if (res.error) throw res.error;
  return res.data;
};

// What a shopper sees when a storefront call fails. The database functions raise their own
// messages for things a customer can fix ("Please enter a valid 10-digit mobile number.",
// "Only 2 left of ..."), which arrive with PostgreSQL's RAISE EXCEPTION code P0001; those pass
// through. Anything else (network, permissions, a missing function) is technical, so the
// caller's plain fallback sentence is shown instead and the raw error stays in the console.
export const ORDER_FAILED_MESSAGE = "We could not place the order. Please try again or message us on WhatsApp.";
export const isCustomerFacingError = (error) => error?.code === "P0001" && typeof error.message === "string" && error.message.trim().length > 0 && error.message.length <= 200;
export const customerMessage = (error, fallback = "Something went wrong. Please try again.") => (isCustomerFacingError(error) ? error.message.trim() : fallback);

export const loadStorefront = async (supabase) => {
  const [products, categories, banners, collections, sizeGuides, settings, ratings] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false }).then(ok),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order", { ascending: true }).then(ok),
    supabase.from("banners").select("*").eq("is_active", true).order("sort_order", { ascending: true }).then(ok),
    supabase.from("collections").select("*").eq("is_active", true).order("sort_order", { ascending: true }).then(ok),
    supabase.from("size_guides").select("*").order("slug", { ascending: true }).then(ok),
    supabase.from("store_settings").select("*").eq("id", 1).maybeSingle().then(ok),
    supabase.from("product_ratings").select("*").then((r) => (r.error ? [] : r.data)),
  ]);
  const ratingMap = {};
  (ratings || []).forEach((r) => {
    ratingMap[r.product_id] = { average: Number(r.average) || 0, count: Number(r.count) || 0 };
  });
  return {
    products: (products || []).map(mapProductRow),
    categories: (categories || []).map(mapCategoryRow),
    banners: (banners || []).map(mapBannerRow),
    collections: (collections || []).map(mapCollectionRow),
    sizeGuides: (sizeGuides || []).map(mapSizeGuideRow),
    settings: mapSettingsRow(settings),
    ratings: ratingMap,
  };
};

export const fetchProductReviews = async (supabase, productId) => {
  const data = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(50)
    .then(ok);
  return (data || []).map(mapReviewRow);
};

export const fetchFeaturedReviews = async (supabase, limit = 6) => {
  const data = await supabase
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .gte("rating", 4)
    .order("created_at", { ascending: false })
    .limit(limit)
    .then(ok);
  return (data || []).map(mapReviewRow);
};

export const submitReview = async (supabase, { productId, productSlug, name, rating, title, body }) => {
  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    product_slug: productSlug,
    name: String(name || "").trim().slice(0, 60),
    rating: Math.max(1, Math.min(5, Math.round(Number(rating) || 0))),
    title: String(title || "").trim().slice(0, 120),
    body: String(body || "").trim().slice(0, 1200),
    is_approved: false,
  });
  if (error) throw error;
  return true;
};

export const validateCouponRemote = async (supabase, code, subtotal) => {
  const { data, error } = await supabase.rpc("validate_coupon", { p_code: String(code || "").trim().toUpperCase(), p_subtotal: Math.round(Number(subtotal) || 0) });
  if (error) throw error;
  return data || { valid: false, discount: 0, message: "Coupon not found." };
};

// payload: { customer: {name, phone, address, city, pincode, note}, items: [{productId, color, size, qty}], couponCode }
export const placeOrderRemote = async (supabase, payload) => {
  const { data, error } = await supabase.rpc("place_order", {
    p_customer: payload.customer,
    p_items: payload.items.map((i) => ({ product_id: i.productId, color: i.color, size: i.size, qty: i.qty })),
    p_coupon: payload.couponCode || null,
  });
  if (error) throw error;
  return data; // { order_number, id, subtotal, discount, delivery_fee, total, items }
};

export const trackOrderRemote = async (supabase, orderNumber, phone) => {
  const { data, error } = await supabase.rpc("track_order", { p_order_number: String(orderNumber || "").trim().toUpperCase(), p_phone: String(phone || "").replace(/\D/g, "").slice(-10) });
  if (error) throw error;
  return data; // null or order summary
};
