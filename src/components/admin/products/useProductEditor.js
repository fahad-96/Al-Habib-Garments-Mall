import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../../context/AdminContext";
import { useShop } from "../../../context/ShopContext";
import { deleteProduct, saveProduct } from "../../../lib/adminApi";
import { slugify } from "../../../lib/format";
import { getDiscount, isLowStock, isSoldOut, productTotalStock, sortSizes } from "../../../lib/catalogUtils";
import { blankVariant, cleanProduct, duplicateOf, firstErrorSection, sizesForSet, validateProduct } from "./productEditor";

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const newKey = () => `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// Variants get a stable client-side key so cards keep their identity when reordered.
// cleanProduct() strips it again before saving.
const withKeys = (product) => ({ ...product, variants: (product.variants || []).map((v, i) => ({ ...v, _key: v._key || `v-${i}` })) });

const scrollToSection = (id) => {
  if (!id) return;
  document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

// All state and actions for one product form. `initial` is read once, on mount.
export function useProductEditor(initial, { onSaved } = {}) {
  const { supabase } = useAdmin();
  const { categories, toast, refreshCatalog } = useShop();
  const navigate = useNavigate();

  const [baseline, setBaseline] = useState(() => withKeys(initial));
  const [product, setProduct] = useState(() => withKeys(initial));
  const [slugPinned, setSlugPinned] = useState(Boolean(initial.id));
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const dirty = useMemo(() => !same(product, baseline), [product, baseline]);
  const errors = useMemo(() => validateProduct(product, categories), [product, categories]);
  const shownErrors = attempted ? errors : {};
  const summary = useMemo(() => {
    const clean = cleanProduct(product);
    return {
      totalStock: productTotalStock(clean),
      discount: getDiscount(clean),
      low: isLowStock(clean),
      soldOut: isSoldOut(clean),
      variantCount: clean.variants.length,
      sizeCount: clean.sizes.length,
      imageCount: clean.variants.reduce((s, v) => s + v.images.length, 0),
    };
  }, [product]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const patch = useCallback((changes) => setProduct((p) => ({ ...p, ...(typeof changes === "function" ? changes(p) : changes) })), []);

  // ── Basics ───────────────────────────────────────────────────────────────
  const setTitle = useCallback((title) => patch({ title, ...(slugPinned ? {} : { slug: slugify(title) }) }), [patch, slugPinned]);
  const setSlug = useCallback(
    (raw) => {
      setSlugPinned(true);
      patch({ slug: String(raw).toLowerCase().replace(/\s+/g, "-") });
    },
    [patch]
  );
  const toggleSlugPinned = useCallback(() => {
    const next = !slugPinned;
    setSlugPinned(next);
    if (!next) patch((p) => ({ slug: slugify(p.title) }));
  }, [slugPinned, patch]);

  const setDepartment = useCallback(
    (department) =>
      patch((p) => {
        const inDepartment = categories.filter((c) => c.department === department);
        const category = inDepartment.find((c) => c.key === p.categoryKey) || inDepartment[0] || null;
        const sizeSet = category?.sizeSet || p.sizeSet;
        return { department, categoryKey: category?.key || "", sizeSet, sizes: sizeSet === p.sizeSet ? p.sizes : sizesForSet(sizeSet) };
      }),
    [patch, categories]
  );
  const setCategory = useCallback(
    (categoryKey) =>
      patch((p) => {
        const category = categories.find((c) => c.key === categoryKey) || null;
        const sizeSet = category?.sizeSet || p.sizeSet;
        return { categoryKey, sizeSet, sizes: sizeSet === p.sizeSet ? p.sizes : sizesForSet(sizeSet) };
      }),
    [patch, categories]
  );

  // ── Sizes ────────────────────────────────────────────────────────────────
  const setSizeSet = useCallback((sizeSet) => patch((p) => (sizeSet === p.sizeSet ? {} : { sizeSet, sizes: sizesForSet(sizeSet) })), [patch]);
  const setSizes = useCallback((sizes) => patch((p) => ({ sizes: sortSizes(sizes, p.sizeSet) })), [patch]);
  const toggleSize = useCallback(
    (size) => patch((p) => ({ sizes: p.sizes.includes(size) ? p.sizes.filter((s) => s !== size) : sortSizes([...p.sizes, size], p.sizeSet) })),
    [patch]
  );

  // ── Variants ─────────────────────────────────────────────────────────────
  const setVariants = useCallback((updater) => patch((p) => ({ variants: updater(p.variants) })), [patch]);
  const updateVariant = useCallback((key, changes) => setVariants((vs) => vs.map((v) => (v._key === key ? { ...v, ...changes } : v))), [setVariants]);
  const addVariant = useCallback(() => setVariants((vs) => [...vs, { ...blankVariant(), _key: newKey() }]), [setVariants]);
  const removeVariant = useCallback((key) => setVariants((vs) => vs.filter((v) => v._key !== key)), [setVariants]);
  const moveVariant = useCallback(
    (key, dir) =>
      setVariants((vs) => {
        const i = vs.findIndex((v) => v._key === key);
        const j = i + dir;
        if (i === -1 || j < 0 || j >= vs.length) return vs;
        const next = [...vs];
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      }),
    [setVariants]
  );

  // ── Persistence ──────────────────────────────────────────────────────────
  const persist = useCallback(
    async (target) => {
      const problems = validateProduct(target, categories);
      if (Object.keys(problems).length) {
        setAttempted(true);
        toast("A few fields need attention before saving.", { type: "error" });
        scrollToSection(firstErrorSection(problems));
        return null;
      }
      if (!supabase) {
        toast("Connect Supabase to save products.", { type: "error" });
        return null;
      }
      setSaving(true);
      setSaveError("");
      try {
        const saved = await saveProduct(supabase, cleanProduct(target));
        refreshCatalog?.();
        return saved;
      } catch (e) {
        const message = e?.message || "Could not save the product.";
        setSaveError(message);
        toast(message, { type: "error", duration: 5000 });
        return null;
      } finally {
        setSaving(false);
      }
    },
    [categories, supabase, toast, refreshCatalog]
  );

  const submit = useCallback(async () => {
    if (saving) return;
    const saved = await persist(product);
    if (!saved) return;
    const keyed = withKeys(saved);
    setBaseline(keyed);
    setProduct(keyed);
    setSlugPinned(true);
    setAttempted(false);
    toast(product.id ? "Product saved." : "Product created.", { type: "success" });
    onSaved?.(saved);
    if (!product.id) navigate(`/admin/products/${saved.id}`, { replace: true });
  }, [saving, persist, product, toast, onSaved, navigate]);

  const duplicate = useCallback(async () => {
    if (saving || dirty || !product.id) return;
    const saved = await persist(duplicateOf(product));
    if (!saved) return;
    toast("Copy created. You are now editing the copy.", { type: "success" });
    onSaved?.(saved);
    navigate(`/admin/products/${saved.id}`);
  }, [saving, dirty, product, persist, toast, onSaved, navigate]);

  const remove = useCallback(async () => {
    if (!supabase || !product.id) return;
    try {
      await deleteProduct(supabase, product.id);
      setBaseline(product);
      toast("Product deleted.", { type: "success" });
      refreshCatalog?.();
      navigate("/admin/products", { replace: true });
    } catch (e) {
      toast(e?.message || "Could not delete the product.", { type: "error", duration: 5000 });
    }
  }, [supabase, product, toast, refreshCatalog, navigate]);

  return {
    product, baseline, patch, dirty, errors: shownErrors, errorCount: Object.keys(errors).length, attempted, summary, saving, saveError,
    slugPinned, setTitle, setSlug, toggleSlugPinned, setDepartment, setCategory,
    setSizeSet, setSizes, toggleSize,
    updateVariant, addVariant, removeVariant, moveVariant,
    submit, duplicate, remove,
  };
}
