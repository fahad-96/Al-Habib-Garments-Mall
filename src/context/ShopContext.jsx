import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  BANNERS as DUMMY_BANNERS, CATEGORIES as DUMMY_CATEGORIES, COLLECTIONS as DUMMY_COLLECTIONS, DEFAULT_SETTINGS,
  PRODUCTS as DUMMY_PRODUCTS, SIZE_GUIDES as DUMMY_SIZE_GUIDES,
} from "../data/catalog";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { loadStorefront, placeOrderRemote, validateCouponRemote } from "../lib/storeApi";
import { computeTotals, MAX_QTY_PER_LINE, variantStock } from "../lib/catalogUtils";
import { buildOrderMessage, openWhatsApp } from "../lib/whatsapp";

const ShopContext = createContext(null);

const KEYS = {
  cart: "ahgm-cart",
  wishlist: "ahgm-wishlist",
  recent: "ahgm-recent",
  customer: "ahgm-customer",
  lastOrder: "ahgm-last-order",
};

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode); the app still works */
  }
};

const EMPTY_CUSTOMER = { name: "", phone: "", address: "", city: "", pincode: "", note: "" };

export function ShopProvider({ children }) {
  // ── Catalog ──────────────────────────────────────────────────────────────
  const [catalog, setCatalog] = useState({
    products: DUMMY_PRODUCTS,
    categories: DUMMY_CATEGORIES,
    banners: DUMMY_BANNERS,
    collections: DUMMY_COLLECTIONS,
    sizeGuides: DUMMY_SIZE_GUIDES,
    settings: DEFAULT_SETTINGS,
    ratings: {},
    source: "dummy",
  });
  const [catalogReady, setCatalogReady] = useState(!isSupabaseConfigured);
  const [catalogError, setCatalogError] = useState("");

  const loadCatalog = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setCatalogReady(true);
      return;
    }
    try {
      const live = await loadStorefront(supabase);
      const hasProducts = live.products.length > 0;
      setCatalog({
        // Once the live catalog has products, it fully replaces the dummy set.
        products: hasProducts ? live.products : DUMMY_PRODUCTS,
        categories: live.categories.length ? live.categories : DUMMY_CATEGORIES,
        banners: hasProducts ? live.banners : live.banners.length ? live.banners : DUMMY_BANNERS,
        collections: hasProducts ? live.collections : live.collections.length ? live.collections : DUMMY_COLLECTIONS,
        sizeGuides: live.sizeGuides.length ? live.sizeGuides : DUMMY_SIZE_GUIDES,
        settings: live.settings,
        ratings: live.ratings,
        source: hasProducts ? "live" : "dummy",
      });
      setCatalogError("");
    } catch (error) {
      console.error("Catalog load failed", error);
      setCatalogError("Could not reach the live catalog. Showing the built-in catalog.");
    } finally {
      setCatalogReady(true);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const { products, categories, banners, collections, sizeGuides, settings, ratings } = catalog;

  const productBySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const productById = useMemo(() => new Map(products.map((p) => [String(p.id), p])), [products]);
  const getProductBySlug = useCallback((slug) => productBySlug.get(slug) || null, [productBySlug]);
  const getProductById = useCallback((id) => productById.get(String(id)) || null, [productById]);
  const getCategory = useCallback((key) => categories.find((c) => c.key === key) || null, [categories]);
  const categoriesFor = useCallback((department) => categories.filter((c) => c.department === department && c.isActive !== false), [categories]);
  const getCollection = useCallback((slug) => collections.find((c) => c.slug === slug) || null, [collections]);
  const collectionProducts = useCallback(
    (collection) => (collection?.productSlugs || []).map((s) => productBySlug.get(s)).filter((p) => p && p.isActive !== false),
    [productBySlug]
  );
  const sizeGuideFor = useCallback(
    (product) => {
      if (!product) return null;
      const exact = sizeGuides.find((g) => g.appliesTo.sizeSets.includes(product.sizeSet) && g.appliesTo.departments.includes(product.department));
      return exact || sizeGuides.find((g) => g.appliesTo.sizeSets.includes(product.sizeSet)) || null;
    },
    [sizeGuides]
  );
  const ratingFor = useCallback((product) => ratings[product?.id] || { average: 0, count: 0 }, [ratings]);

  // ── Toasts ───────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (message, options = {}) => {
      const id = ++toastId.current;
      const entry = { id, message, type: options.type || "info", action: options.action || null };
      setToasts((t) => [...t.slice(-2), entry]);
      window.setTimeout(() => dismissToast(id), options.duration || 3200);
      return id;
    },
    [dismissToast]
  );

  // ── Cart ─────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState(() => {
    const stored = readJson(KEYS.cart, []);
    return Array.isArray(stored) ? stored.filter((i) => i && i.slug && i.size && i.qty > 0) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => writeJson(KEYS.cart, cartItems), [cartItems]);

  const lineKey = (slug, color, size) => `${slug}__${color}__${size}`;

  const cartLines = useMemo(
    () =>
      cartItems.map((item) => {
        const product = productBySlug.get(item.slug) || null;
        const variant = product?.variants.find((v) => v.color === item.color) || null;
        const stock = variant ? variantStock(variant, item.size) : 0;
        return {
          key: lineKey(item.slug, item.color, item.size),
          ...item,
          product,
          variant,
          stock,
          available: Boolean(product && variant && stock > 0),
          price: product?.price || 0,
          mrp: product?.mrp || 0,
          title: product?.title || item.title || "Unavailable item",
          image: variant?.images?.[0] || "",
        };
      }),
    [cartItems, productBySlug]
  );

  const addToCart = useCallback(
    (product, color, size, qty = 1) => {
      const variant = product?.variants.find((v) => v.color === color);
      if (!product || !variant) return { ok: false, reason: "Choose a colour." };
      if (!size) return { ok: false, reason: "Choose a size." };
      const stock = variantStock(variant, size);
      if (stock <= 0) return { ok: false, reason: "That size is sold out." };
      let result = { ok: true };
      setCartItems((prev) => {
        const idx = prev.findIndex((i) => i.slug === product.slug && i.color === color && i.size === size);
        const current = idx === -1 ? 0 : prev[idx].qty;
        const next = Math.min(current + qty, stock, MAX_QTY_PER_LINE);
        if (next === current) {
          result = { ok: false, reason: stock <= current ? `Only ${stock} left in this size.` : `Maximum ${MAX_QTY_PER_LINE} per item.` };
          return prev;
        }
        const entry = { productId: product.id, slug: product.slug, title: product.title, color, size, qty: next, addedAt: Date.now() };
        if (idx === -1) return [...prev, entry];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: next };
        return copy;
      });
      return result;
    },
    []
  );

  const updateCartQty = useCallback((key, nextQty) => {
    setCartItems((prev) =>
      prev
        .map((i) => (lineKey(i.slug, i.color, i.size) === key ? { ...i, qty: Math.max(0, Math.min(Number(nextQty) || 0, MAX_QTY_PER_LINE)) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const removeCartItem = useCallback((key) => setCartItems((prev) => prev.filter((i) => lineKey(i.slug, i.color, i.size) !== key)), []);
  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = useMemo(() => cartItems.reduce((s, i) => s + i.qty, 0), [cartItems]);

  // ── Coupon ───────────────────────────────────────────────────────────────
  const [coupon, setCoupon] = useState({ code: "", discount: 0, message: "", valid: false, checking: false });
  const availableLines = useMemo(() => cartLines.filter((l) => l.available), [cartLines]);
  const rawSubtotal = useMemo(() => availableLines.reduce((s, l) => s + l.price * Math.min(l.qty, l.stock), 0), [availableLines]);

  const applyCoupon = useCallback(
    async (code) => {
      const clean = String(code || "").trim().toUpperCase();
      if (!clean) return { valid: false, message: "Enter a coupon code." };
      if (!isSupabaseConfigured || !supabase) {
        const res = { code: clean, discount: 0, message: "Coupons are available once the store is connected to its database.", valid: false, checking: false };
        setCoupon(res);
        return res;
      }
      setCoupon((c) => ({ ...c, checking: true }));
      try {
        const data = await validateCouponRemote(supabase, clean, rawSubtotal);
        const res = { code: data.valid ? clean : "", discount: Number(data.discount) || 0, message: data.message || "", valid: Boolean(data.valid), checking: false };
        setCoupon(res);
        return res;
      } catch {
        const res = { code: "", discount: 0, message: "Could not check the coupon. Try again.", valid: false, checking: false };
        setCoupon(res);
        return res;
      }
    },
    [rawSubtotal]
  );
  const removeCoupon = useCallback(() => setCoupon({ code: "", discount: 0, message: "", valid: false, checking: false }), []);

  // Re-validate silently when the subtotal changes and a coupon is applied.
  useEffect(() => {
    if (!coupon.valid || !coupon.code) return;
    if (!isSupabaseConfigured || !supabase) return;
    let cancelled = false;
    validateCouponRemote(supabase, coupon.code, rawSubtotal)
      .then((data) => {
        if (cancelled) return;
        setCoupon((c) => ({ ...c, discount: Number(data.discount) || 0, valid: Boolean(data.valid), message: data.message || c.message }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawSubtotal]);

  const totals = useMemo(
    () => computeTotals({ lines: availableLines.map((l) => ({ ...l, qty: Math.min(l.qty, l.stock) })), discount: coupon.valid ? coupon.discount : 0, settings }),
    [availableLines, coupon, settings]
  );

  // ── Wishlist / recently viewed / customer ────────────────────────────────
  const [wishlist, setWishlist] = useState(() => {
    const s = readJson(KEYS.wishlist, []);
    return Array.isArray(s) ? s.filter((x) => typeof x === "string") : [];
  });
  useEffect(() => writeJson(KEYS.wishlist, wishlist), [wishlist]);
  const inWishlist = useCallback((slug) => wishlist.includes(slug), [wishlist]);
  const toggleWishlist = useCallback((slug) => {
    let added = false;
    setWishlist((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      added = true;
      return [slug, ...prev].slice(0, 100);
    });
    return added;
  }, []);
  const wishlistProducts = useMemo(() => wishlist.map((s) => productBySlug.get(s)).filter(Boolean), [wishlist, productBySlug]);

  const [recent, setRecent] = useState(() => {
    const s = readJson(KEYS.recent, []);
    return Array.isArray(s) ? s : [];
  });
  useEffect(() => writeJson(KEYS.recent, recent), [recent]);
  const pushRecent = useCallback((slug) => setRecent((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 12)), []);
  const recentProducts = useMemo(() => recent.map((s) => productBySlug.get(s)).filter(Boolean), [recent, productBySlug]);

  const [customer, setCustomerState] = useState(() => ({ ...EMPTY_CUSTOMER, ...readJson(KEYS.customer, {}) }));
  const setCustomer = useCallback((patch) => setCustomerState((c) => ({ ...c, ...(typeof patch === "function" ? patch(c) : patch) })), []);
  useEffect(() => writeJson(KEYS.customer, customer), [customer]);

  // ── Search overlay ───────────────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);

  // ── Order placement ──────────────────────────────────────────────────────
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState(() => readJson(KEYS.lastOrder, null));

  const placeOrder = useCallback(async () => {
    const lines = availableLines.map((l) => ({ ...l, qty: Math.min(l.qty, l.stock) })).filter((l) => l.qty > 0);
    if (!lines.length) return { ok: false, error: "Your bag is empty." };
    setPlacing(true);
    try {
      let orderNumber = null;
      let finalTotals = totals;
      if (isSupabaseConfigured && supabase) {
        const data = await placeOrderRemote(supabase, {
          customer,
          items: lines.map((l) => ({ productId: l.product.id, color: l.color, size: l.size, qty: l.qty })),
          couponCode: coupon.valid ? coupon.code : "",
        });
        orderNumber = data?.order_number || null;
        if (data) {
          finalTotals = {
            subtotal: Number(data.subtotal) || totals.subtotal,
            discount: Number(data.discount) || 0,
            deliveryFee: Number(data.delivery_fee) || 0,
            total: Number(data.total) || totals.total,
          };
        }
      }
      const summary = {
        orderNumber,
        createdAt: new Date().toISOString(),
        lines: lines.map((l) => ({ slug: l.slug, title: l.title, color: l.color, size: l.size, qty: l.qty, price: l.price, mrp: l.mrp, image: l.image })),
        totals: { ...finalTotals, couponCode: coupon.valid ? coupon.code : "" },
        customer: { ...customer },
      };
      const message = buildOrderMessage({
        storeName: settings.storeName,
        orderNumber,
        lines: summary.lines,
        totals: summary.totals,
        customer,
        siteUrl: typeof window !== "undefined" ? window.location.origin : "",
      });
      openWhatsApp(settings.whatsappNumber, message);
      setLastOrder(summary);
      writeJson(KEYS.lastOrder, summary);
      clearCart();
      removeCoupon();
      setCartOpen(false);
      return { ok: true, order: summary };
    } catch (error) {
      console.error("Order failed", error);
      const msg = String(error?.message || "");
      return { ok: false, error: msg || "Could not place the order. Please try again or message us on WhatsApp." };
    } finally {
      setPlacing(false);
    }
  }, [availableLines, totals, customer, coupon, settings, clearCart, removeCoupon]);

  const value = useMemo(
    () => ({
      // catalog
      products, categories, banners, collections, sizeGuides, settings, ratings, catalogReady, catalogError, catalogSource: catalog.source,
      refreshCatalog: loadCatalog, getProductBySlug, getProductById, getCategory, categoriesFor, getCollection, collectionProducts, sizeGuideFor, ratingFor,
      // cart
      cartItems, cartLines, cartCount, cartOpen, setCartOpen, addToCart, updateCartQty, removeCartItem, clearCart, totals, rawSubtotal,
      coupon, applyCoupon, removeCoupon,
      // wishlist / recent / customer
      wishlist, wishlistProducts, inWishlist, toggleWishlist, recentProducts, pushRecent, customer, setCustomer,
      // ui
      toasts, toast, dismissToast, searchOpen, setSearchOpen,
      // orders
      placeOrder, placing, lastOrder,
      isSupabaseConfigured,
    }),
    [
      products, categories, banners, collections, sizeGuides, settings, ratings, catalogReady, catalogError, catalog.source, loadCatalog,
      getProductBySlug, getProductById, getCategory, categoriesFor, getCollection, collectionProducts, sizeGuideFor, ratingFor,
      cartItems, cartLines, cartCount, cartOpen, addToCart, updateCartQty, removeCartItem, clearCart, totals, rawSubtotal, coupon, applyCoupon, removeCoupon,
      wishlist, wishlistProducts, inWishlist, toggleWishlist, recentProducts, pushRecent, customer, setCustomer,
      toasts, toast, dismissToast, searchOpen, placeOrder, placing, lastOrder,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
