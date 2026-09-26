import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  BANNERS as DUMMY_BANNERS, CATEGORIES as DUMMY_CATEGORIES, COLLECTIONS as DUMMY_COLLECTIONS, DEFAULT_SETTINGS, DEPARTMENTS,
  PRODUCTS as DUMMY_PRODUCTS, SIZE_GUIDES as DUMMY_SIZE_GUIDES,
} from "../data/catalog";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { customerMessage, isCustomerFacingError, loadStorefront, ORDER_FAILED_MESSAGE, placeOrderRemote, validateCouponRemote } from "../lib/storeApi";
import { computeTotals, MAX_QTY_PER_LINE, variantStock } from "../lib/catalogUtils";
import { buildOrderMessage, cleanCustomer, CUSTOMER_LIMITS, openWhatsApp, waLink } from "../lib/whatsapp";

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
const removeKey = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

const EMPTY_CUSTOMER = { name: "", phone: "", address: "", city: "", pincode: "", note: "" };
// place_order only accepts database product ids; demo products ("dummy-...") are ordered on WhatsApp alone.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COUPON_ON_WHATSAPP = "Have a coupon? Mention it on WhatsApp and we will apply it.";
const EMPTY_COUPON = { code: "", discount: 0, message: "", valid: false, checking: false };

const isObject = (v) => Boolean(v) && typeof v === "object" && !Array.isArray(v);
const isText = (v) => typeof v === "string";
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const lineKey = (slug, color, size) => `${slug}__${color}__${size}`;

// ── Stored shapes: everything read back from localStorage is validated, anything malformed is dropped ──
const toCartItem = (i) => {
  if (!isObject(i) || !isText(i.slug) || !i.slug || !isText(i.color) || !isText(i.size) || !i.size) return null;
  if (typeof i.qty !== "number" || !Number.isInteger(i.qty) || i.qty < 1 || i.qty > MAX_QTY_PER_LINE) return null;
  return {
    productId: isText(i.productId) || typeof i.productId === "number" ? String(i.productId) : "",
    slug: i.slug.slice(0, 160),
    title: isText(i.title) ? i.title.slice(0, 160) : "",
    color: i.color.slice(0, 60),
    size: i.size.slice(0, 20),
    qty: i.qty,
    addedAt: num(i.addedAt),
  };
};
const readCart = () => {
  const stored = readJson(KEYS.cart, []);
  if (!Array.isArray(stored)) return [];
  const seen = new Set();
  return stored
    .map(toCartItem)
    .filter((i) => {
      if (!i) return false;
      const key = lineKey(i.slug, i.color, i.size);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 50);
};
const readSlugList = (key, max) => {
  const stored = readJson(key, []);
  if (!Array.isArray(stored)) return [];
  return Array.from(new Set(stored.filter((s) => isText(s) && s.length > 0 && s.length <= 160))).slice(0, max);
};
// Keeps the stored customer to the known fields, as strings within the order limits. Values are
// not trimmed here (that would fight the shopper while typing); they are cleaned when an order is sent.
const normalizeCustomer = (c) => {
  const src = isObject(c) ? c : {};
  const out = { ...EMPTY_CUSTOMER };
  Object.keys(EMPTY_CUSTOMER).forEach((k) => {
    out[k] = isText(src[k]) ? src[k].slice(0, CUSTOMER_LIMITS[k]) : "";
  });
  return out;
};
const toOrderLine = (l) => {
  if (!isObject(l)) return null;
  return {
    slug: isText(l.slug) ? l.slug : "",
    title: isText(l.title) ? l.title : "Item",
    color: isText(l.color) ? l.color : "",
    size: isText(l.size) ? l.size : "",
    qty: Math.max(0, Math.floor(num(l.qty))),
    price: num(l.price),
    mrp: num(l.mrp),
    image: isText(l.image) ? l.image : "",
  };
};
const readLastOrder = () => {
  const stored = readJson(KEYS.lastOrder, null);
  const lines = isObject(stored) && Array.isArray(stored.lines) ? stored.lines.map(toOrderLine).filter(Boolean) : [];
  if (!lines.length) {
    if (stored !== null) removeKey(KEYS.lastOrder);
    return null;
  }
  const t = isObject(stored.totals) ? stored.totals : {};
  return {
    orderNumber: isText(stored.orderNumber) ? stored.orderNumber.slice(0, 20) : null,
    createdAt: isText(stored.createdAt) ? stored.createdAt : "",
    lines,
    totals: {
      subtotal: num(t.subtotal), mrpTotal: num(t.mrpTotal), savings: num(t.savings), discount: num(t.discount),
      deliveryFee: num(t.deliveryFee), total: num(t.total), itemCount: num(t.itemCount), couponCode: isText(t.couponCode) ? t.couponCode : "",
    },
    customer: normalizeCustomer(stored.customer),
    whatsappLink: isText(stored.whatsappLink) && stored.whatsappLink.startsWith("https://wa.me/") ? stored.whatsappLink : "",
  };
};

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
      setCatalogError("Some prices and stock may be out of date right now. We confirm every order on WhatsApp.");
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
  // Only categories that currently have live products are navigable on the storefront.
  const stockedCategoryKeys = useMemo(() => new Set(products.filter((p) => p.isActive !== false).map((p) => p.categoryKey)), [products]);
  const categoriesFor = useCallback(
    (department) => categories.filter((c) => c.department === department && c.isActive !== false && stockedCategoryKeys.has(c.key)),
    [categories, stockedCategoryKeys]
  );
  // Departments shown in navigation: those with at least one stocked category (Kids appears once kids products exist).
  const departments = useMemo(
    () => DEPARTMENTS.filter((d) => categories.some((c) => c.department === d.key && c.isActive !== false && stockedCategoryKeys.has(c.key))),
    [categories, stockedCategoryKeys]
  );
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
  // Every change is computed from `cartRef` (always the latest list) and then committed, so a
  // function can report what it actually did. React may run a setState updater later, during
  // the next render, so results must never be read back from inside one.
  const [cartItems, setCartItems] = useState(readCart);
  const cartRef = useRef(cartItems);
  const commitCart = useCallback((next) => {
    cartRef.current = next;
    setCartItems(next);
  }, []);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => writeJson(KEYS.cart, cartItems), [cartItems]);

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

  // → { ok, reason } on failure; { ok, added, capped, message } on success. `message` says honestly
  // what happened when stock or the per-item limit allowed fewer than were asked for.
  const addToCart = useCallback((product, color, size, qty = 1) => {
    const variant = product?.variants?.find((v) => v.color === color);
    if (!product || !variant) return { ok: false, reason: "Choose a colour." };
    if (!size) return { ok: false, reason: "Choose a size." };
    const stock = variantStock(variant, size);
    if (stock <= 0) return { ok: false, reason: "That size is sold out." };
    const wanted = Math.max(1, Math.floor(Number(qty)) || 1);
    const prev = cartRef.current;
    const idx = prev.findIndex((i) => i.slug === product.slug && i.color === color && i.size === size);
    const current = idx === -1 ? 0 : prev[idx].qty;
    const cap = Math.min(stock, MAX_QTY_PER_LINE);
    const room = cap - current;
    if (room <= 0) {
      if (stock <= MAX_QTY_PER_LINE) {
        return { ok: false, reason: stock === 1 ? "The last one in this size is already in your bag." : `All ${stock} left in this size are already in your bag.` };
      }
      return { ok: false, reason: `You can order up to ${MAX_QTY_PER_LINE} of each piece.` };
    }
    const added = Math.min(wanted, room);
    const next = current + added;
    const entry = { productId: String(product.id ?? ""), slug: product.slug, title: product.title, color, size, qty: next, addedAt: Date.now() };
    commitCart(idx === -1 ? [...prev, entry] : prev.map((i, n) => (n === idx ? { ...i, qty: next } : i)));
    const capped = added < wanted;
    let message = "Added to your bag";
    if (capped && stock <= MAX_QTY_PER_LINE) {
      message = current === 0 ? `Added ${added}. Only ${stock} ${stock === 1 ? "was" : "were"} left in this size.` : `Added ${added}. Your bag now has all ${stock} left in this size.`;
    } else if (capped) {
      message = `Added ${added}. You can order up to ${MAX_QTY_PER_LINE} of each piece.`;
    }
    return { ok: true, added, capped, message };
  }, [commitCart]);

  // Quantity is kept between 1 and what is in stock (never above the per-item limit); 0 removes the line.
  const updateCartQty = useCallback(
    (key, nextQty) => {
      const next = cartRef.current
        .map((i) => {
          if (lineKey(i.slug, i.color, i.size) !== key) return i;
          const variant = productBySlug.get(i.slug)?.variants.find((v) => v.color === i.color);
          const stock = variant ? variantStock(variant, i.size) : 0;
          const cap = stock > 0 ? Math.min(stock, MAX_QTY_PER_LINE) : MAX_QTY_PER_LINE;
          return { ...i, qty: Math.max(0, Math.min(Math.floor(Number(nextQty)) || 0, cap)) };
        })
        .filter((i) => i.qty > 0);
      commitCart(next);
    },
    [productBySlug, commitCart]
  );

  // Returns what was removed and where (its index and the line it followed), so an Undo can put it back in place.
  const removeCartItem = useCallback(
    (key) => {
      const prev = cartRef.current;
      const index = prev.findIndex((i) => lineKey(i.slug, i.color, i.size) === key);
      if (index === -1) return null;
      commitCart(prev.filter((_, n) => n !== index));
      const before = prev[index - 1];
      return { item: prev[index], index, after: before ? lineKey(before.slug, before.color, before.size) : null };
    },
    [commitCart]
  );
  // Puts a removed line back (see removeCartItem). Does nothing if that line is in the bag again.
  const restoreCartItem = useCallback(
    (item, index = cartRef.current.length, after) => {
      const clean = toCartItem(item);
      if (!clean) return false;
      const prev = cartRef.current;
      const keys = prev.map((i) => lineKey(i.slug, i.color, i.size));
      if (keys.includes(lineKey(clean.slug, clean.color, clean.size))) return false;
      const anchor = isText(after) ? keys.indexOf(after) : -1;
      const at = after === null ? 0 : anchor !== -1 ? anchor + 1 : Math.max(0, Math.min(Number(index) || 0, prev.length));
      commitCart([...prev.slice(0, at), clean, ...prev.slice(at)]);
      return true;
    },
    [commitCart]
  );
  const clearCart = useCallback(() => commitCart([]), [commitCart]);

  // ── Coupon ───────────────────────────────────────────────────────────────
  // Orders (and coupons) go through the database only once it serves the real catalog. Until then
  // the demo products have no database ids, so orders are sent on WhatsApp alone.
  const ordersOnline = Boolean(isSupabaseConfigured && supabase && catalog.source === "live");
  const [coupon, setCoupon] = useState(EMPTY_COUPON);
  const availableLines = useMemo(() => cartLines.filter((l) => l.available), [cartLines]);
  const rawSubtotal = useMemo(() => availableLines.reduce((s, l) => s + l.price * Math.min(l.qty, l.stock), 0), [availableLines]);

  // What the header badge and the drawer count: pieces that can be ordered, capped at stock. While the
  // catalog is still loading the stored quantities are counted, so the badge does not blink to zero.
  const cartCount = useMemo(
    () => (catalogReady ? availableLines.reduce((s, l) => s + Math.min(l.qty, l.stock), 0) : cartItems.reduce((s, i) => s + i.qty, 0)),
    [catalogReady, availableLines, cartItems]
  );

  const applyCoupon = useCallback(
    async (code) => {
      const clean = String(code || "").trim().toUpperCase();
      if (!clean) return { valid: false, message: "Enter a coupon code." };
      if (!ordersOnline) {
        const res = { ...EMPTY_COUPON, message: COUPON_ON_WHATSAPP };
        setCoupon(res);
        return res;
      }
      setCoupon((c) => ({ ...c, checking: true }));
      try {
        const data = await validateCouponRemote(supabase, clean, rawSubtotal);
        const res = { code: data.valid ? clean : "", discount: Number(data.discount) || 0, message: data.message || "", valid: Boolean(data.valid), checking: false };
        setCoupon(res);
        return res;
      } catch (error) {
        console.error("Coupon check failed", error);
        const res = { ...EMPTY_COUPON, message: "We could not check that code. Please try again." };
        setCoupon(res);
        return res;
      }
    },
    [rawSubtotal, ordersOnline]
  );
  const removeCoupon = useCallback(() => setCoupon(EMPTY_COUPON), []);

  // Re-validate silently when the subtotal changes and a coupon is applied.
  useEffect(() => {
    if (!coupon.valid || !coupon.code || !ordersOnline) return;
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

  const couponDiscount = ordersOnline && coupon.valid ? coupon.discount : 0;
  const totals = useMemo(
    () => computeTotals({ lines: availableLines.map((l) => ({ ...l, qty: Math.min(l.qty, l.stock) })), discount: couponDiscount, settings }),
    [availableLines, couponDiscount, settings]
  );

  // ── Wishlist / recently viewed / customer ────────────────────────────────
  const [wishlist, setWishlist] = useState(() => readSlugList(KEYS.wishlist, 100));
  const wishlistRef = useRef(wishlist);
  const commitWishlist = useCallback((next) => {
    wishlistRef.current = next;
    setWishlist(next);
  }, []);
  useEffect(() => writeJson(KEYS.wishlist, wishlist), [wishlist]);
  const inWishlist = useCallback((slug) => wishlist.includes(slug), [wishlist]);
  // → true when the piece was saved, false when it was removed.
  const toggleWishlist = useCallback(
    (slug) => {
      if (!isText(slug) || !slug) return false;
      const prev = wishlistRef.current;
      if (prev.includes(slug)) {
        commitWishlist(prev.filter((s) => s !== slug));
        return false;
      }
      commitWishlist([slug, ...prev].slice(0, 100));
      return true;
    },
    [commitWishlist]
  );
  // Saves a piece at a position (default: first). `after` names the piece it followed, which keeps
  // the slot right even when other pieces were removed or restored since; `index` is the fallback.
  // Does nothing if the piece is already saved, so an Undo never un-saves it.
  const addToWishlist = useCallback(
    (slug, index = 0, after) => {
      const prev = wishlistRef.current;
      if (!isText(slug) || !slug || prev.includes(slug)) return false;
      const anchor = isText(after) ? prev.indexOf(after) : -1;
      const at = after === null ? 0 : anchor !== -1 ? anchor + 1 : Math.max(0, Math.min(Number(index) || 0, prev.length));
      commitWishlist([...prev.slice(0, at), slug, ...prev.slice(at)].slice(0, 100));
      return true;
    },
    [commitWishlist]
  );
  const wishlistProducts = useMemo(() => wishlist.map((s) => productBySlug.get(s)).filter(Boolean), [wishlist, productBySlug]);

  const [recent, setRecent] = useState(() => readSlugList(KEYS.recent, 12));
  useEffect(() => writeJson(KEYS.recent, recent), [recent]);
  const pushRecent = useCallback((slug) => {
    if (!isText(slug) || !slug) return;
    setRecent((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 12));
  }, []);
  const recentProducts = useMemo(() => recent.map((s) => productBySlug.get(s)).filter(Boolean), [recent, productBySlug]);

  const [customer, setCustomerState] = useState(() => normalizeCustomer(readJson(KEYS.customer, {})));
  const setCustomer = useCallback(
    (patch) => setCustomerState((c) => normalizeCustomer({ ...c, ...(typeof patch === "function" ? patch(c) : patch) })),
    []
  );
  useEffect(() => writeJson(KEYS.customer, customer), [customer]);

  // ── Search overlay ───────────────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);

  // ── Order placement ──────────────────────────────────────────────────────
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState(readLastOrder);

  // Saves the order in the database when the real catalog is live (that gives it a number and
  // reserves the stock), then opens WhatsApp with the order ready to send. With the demo catalog,
  // or `{ direct: true }` after a failed save, it goes straight to WhatsApp without a number.
  // → { ok: true, order } or { ok: false, error, canSendDirect }.
  const placeOrder = useCallback(
    async ({ direct = false } = {}) => {
      const lines = availableLines.map((l) => ({ ...l, qty: Math.min(l.qty, l.stock) })).filter((l) => l.qty > 0);
      if (!lines.length) return { ok: false, error: "Your bag is empty." };
      const buyer = cleanCustomer(customer);
      const couponCode = coupon.valid && couponDiscount > 0 ? coupon.code : "";
      const useDb = !direct && ordersOnline && lines.every((l) => UUID_RE.test(String(l.product?.id ?? "")));
      setPlacing(true);
      // Open the tab synchronously inside the click so mobile browsers do not block it,
      // then point it at WhatsApp once the order is saved.
      let popup = null;
      if (useDb) {
        try {
          popup = window.open("about:blank", "_blank");
          if (popup) popup.opener = null;
        } catch {
          popup = null;
        }
      }
      try {
        let orderNumber = null;
        let finalTotals = totals;
        let orderLines = lines.map((l) => ({ slug: l.slug, title: l.title, color: l.color, size: l.size, qty: l.qty, price: l.price, mrp: l.mrp, image: l.image }));
        if (useDb) {
          const data = await placeOrderRemote(supabase, {
            customer: buyer,
            items: lines.map((l) => ({ productId: l.product.id, color: l.color, size: l.size, qty: l.qty })),
            couponCode,
          });
          orderNumber = isText(data?.order_number) ? data.order_number : null;
          if (isObject(data)) {
            // The database priced the order; show its figures, keeping the client's MRP breakdown.
            const saved = Array.isArray(data.items) ? data.items.filter(isObject) : [];
            orderLines = orderLines.map((l, n) => {
              const hit = saved.find((x) => String(x.product_id) === String(lines[n].product.id) && x.color === l.color && x.size === l.size);
              return hit ? { ...l, price: num(hit.price) || l.price, mrp: num(hit.mrp) || l.mrp } : l;
            });
            const subtotal = Number.isFinite(Number(data.subtotal)) ? Number(data.subtotal) : totals.subtotal;
            const mrpTotal = orderLines.reduce((sum, l) => sum + (l.mrp || l.price) * l.qty, 0);
            finalTotals = {
              ...totals,
              subtotal,
              mrpTotal,
              savings: Math.max(0, mrpTotal - subtotal),
              discount: num(data.discount),
              deliveryFee: num(data.delivery_fee),
              total: Number.isFinite(Number(data.total)) ? Number(data.total) : totals.total,
              itemCount: num(data.item_count) || totals.itemCount,
            };
          }
        }
        const summary = {
          orderNumber,
          createdAt: new Date().toISOString(),
          lines: orderLines,
          totals: { ...finalTotals, couponCode: finalTotals.discount > 0 ? couponCode : "" },
          customer: buyer,
        };
        const message = buildOrderMessage({
          storeName: settings.storeName,
          orderNumber,
          lines: summary.lines,
          totals: summary.totals,
          customer: buyer,
          siteUrl: typeof window !== "undefined" ? window.location.origin : "",
        });
        const link = waLink(settings.whatsappNumber, message);
        if (popup && !popup.closed) popup.location.href = link;
        else openWhatsApp(settings.whatsappNumber, message);
        summary.whatsappLink = link;
        setLastOrder(summary);
        writeJson(KEYS.lastOrder, summary);
        clearCart();
        removeCoupon();
        setCartOpen(false);
        return { ok: true, order: summary };
      } catch (error) {
        if (popup && !popup.closed) popup.close();
        // A reason the shopper can act on (a phone number, stock) is shown as is. For anything
        // technical, log it and offer to send the order on WhatsApp instead so it is never lost.
        const forShopper = isCustomerFacingError(error);
        if (!forShopper) console.error("Order failed", error);
        return { ok: false, error: customerMessage(error, ORDER_FAILED_MESSAGE), canSendDirect: !forShopper };
      } finally {
        setPlacing(false);
      }
    },
    [availableLines, totals, customer, coupon, couponDiscount, ordersOnline, settings, clearCart, removeCoupon]
  );

  const value = useMemo(
    () => ({
      // catalog
      products, categories, departments, banners, collections, sizeGuides, settings, ratings, catalogReady, catalogError, catalogSource: catalog.source,
      refreshCatalog: loadCatalog, getProductBySlug, getProductById, getCategory, categoriesFor, getCollection, collectionProducts, sizeGuideFor, ratingFor,
      // cart
      cartItems, cartLines, cartCount, cartOpen, setCartOpen, addToCart, updateCartQty, removeCartItem, restoreCartItem, clearCart, totals, rawSubtotal,
      coupon, applyCoupon, removeCoupon,
      // wishlist / recent / customer
      wishlist, wishlistProducts, inWishlist, toggleWishlist, addToWishlist, recentProducts, pushRecent, customer, setCustomer,
      // ui
      toasts, toast, dismissToast, searchOpen, setSearchOpen,
      // orders
      placeOrder, placing, lastOrder, ordersOnline,
      isSupabaseConfigured,
    }),
    [
      products, categories, departments, banners, collections, sizeGuides, settings, ratings, catalogReady, catalogError, catalog.source, loadCatalog,
      getProductBySlug, getProductById, getCategory, categoriesFor, getCollection, collectionProducts, sizeGuideFor, ratingFor,
      cartItems, cartLines, cartCount, cartOpen, addToCart, updateCartQty, removeCartItem, restoreCartItem, clearCart, totals, rawSubtotal, coupon, applyCoupon, removeCoupon,
      wishlist, wishlistProducts, inWishlist, toggleWishlist, addToWishlist, recentProducts, pushRecent, customer, setCustomer,
      toasts, toast, dismissToast, searchOpen, placeOrder, placing, lastOrder, ordersOnline,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
