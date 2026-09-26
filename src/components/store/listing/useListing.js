import { useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useShop } from "../../../context/ShopContext";
import { DEPARTMENTS } from "../../../data/catalog";
import {
  EMPTY_FILTERS,
  SORT_OPTIONS,
  activeFilterCount,
  applyFilters,
  facetsFor,
  filtersFromSearchParams,
  filtersToSearchParams,
  getDiscount,
  isNewProduct,
  isSoldOut,
  searchProducts,
  sortProducts,
} from "../../../lib/catalogUtils";

export const PAGE_SIZE = 24;
// Longer queries add nothing to the match and only stretch the page and the tab title.
export const MAX_QUERY_LENGTH = 100;
const SORT_VALUES = new Set(SORT_OPTIONS.map((o) => o.value));

// Order-insensitive comparison, so a no-op filter change is recognised as one.
const sameParams = (a, b) => {
  const x = new URLSearchParams(a);
  const y = new URLSearchParams(b);
  x.sort();
  y.sort();
  return x.toString() === y.toString();
};

// "Recommended" means the mode's natural order: relevance for search, the
// curated order for collections, newest for new-in, biggest markdown for sale.
const naturalOrder = (mode, list) => {
  switch (mode) {
    case "new":
      return sortProducts(list, "newest");
    case "sale":
      return sortProducts(list, "discount");
    case "search":
    case "collection":
      return list;
    default:
      return sortProducts(list, "recommended");
  }
};

const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

export function useListing(mode) {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, categoriesFor, getCategory, getCollection, collectionProducts, catalogReady } = useShop();

  const q = (searchParams.get("q") || "").trim().slice(0, MAX_QUERY_LENGTH).trim();
  const department = useMemo(() => DEPARTMENTS.find((d) => d.key === params.department) || null, [params.department]);
  const category = useMemo(
    () => (mode === "category" && params.department && params.categorySlug ? getCategory(`${params.department}-${params.categorySlug}`) : null),
    [mode, params.department, params.categorySlug, getCategory]
  );
  const collection = useMemo(() => (mode === "collection" ? getCollection(params.slug) : null), [mode, params.slug, getCollection]);

  const activeProducts = useMemo(() => products.filter((p) => p && p.isActive !== false), [products]);

  const base = useMemo(() => {
    switch (mode) {
      case "department":
        return department ? activeProducts.filter((p) => p.department === department.key) : [];
      case "category":
        return category ? activeProducts.filter((p) => p.categoryKey === category.key) : [];
      case "new":
        return activeProducts.filter(isNewProduct);
      case "sale":
        return activeProducts.filter((p) => getDiscount(p) > 0);
      case "search":
        return q ? searchProducts(activeProducts, q, categories) : [];
      case "collection":
        return collectionProducts(collection);
      default:
        return activeProducts;
    }
  }, [mode, department, category, collection, q, activeProducts, categories, collectionProducts]);

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const sortParam = searchParams.get("sort");
  const sort = SORT_VALUES.has(sortParam) ? sortParam : "recommended";
  const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));

  const facets = useMemo(() => ({ ...facetsFor(base, categories), inStock: base.filter((p) => !isSoldOut(p)).length, total: base.length }), [base, categories]);
  const filtered = useMemo(() => applyFilters(base, filters), [base, filters]);
  const sorted = useMemo(() => (sort === "recommended" ? naturalOrder(mode, filtered) : sortProducts(filtered, sort)), [mode, filtered, sort]);
  const visible = useMemo(() => sorted.slice(0, page * PAGE_SIZE), [sorted, page]);
  const filterCount = activeFilterCount(filters);

  // Categories whose name matches the query (search mode only). Empty ones (Kids until it has
  // stock) are left out: the chip would lead to an empty page.
  const matchingCategories = useMemo(() => {
    if (mode !== "search" || !q) return [];
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    const stocked = new Set(activeProducts.map((p) => p.categoryKey));
    return categories.filter((c) => c.isActive !== false && stocked.has(c.key) && tokens.some((t) => norm(c.name).includes(t) || norm(c.department) === t)).slice(0, 6);
  }, [mode, q, categories, activeProducts]);

  // Filters, sort and "load more" refine the page the shopper is already on, so they replace the
  // current history entry: Back leaves the listing in one press instead of undoing each tap.
  // A change that leaves the query string as it was does not navigate at all.
  const update = useCallback(
    (mutate) => {
      const next = new URLSearchParams(searchParams);
      mutate(next);
      if (sameParams(next, searchParams)) return;
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setFilters = useCallback(
    (next) =>
      update((sp) => {
        filtersToSearchParams(next, sp);
        sp.delete("page");
      }),
    [update]
  );
  const patchFilters = useCallback((patch) => setFilters({ ...filters, ...patch }), [filters, setFilters]);
  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), [setFilters]);
  const setSort = useCallback(
    (value) =>
      update((sp) => {
        if (!value || value === "recommended") sp.delete("sort");
        else sp.set("sort", value);
        sp.delete("page");
      }),
    [update]
  );
  const loadMore = useCallback(() => update((sp) => sp.set("page", String(page + 1))), [update, page]);
  const countFor = useCallback((draft) => applyFilters(base, draft).length, [base]);

  return {
    mode,
    q,
    department,
    category,
    collection,
    categories,
    categoriesFor,
    catalogReady,
    base,
    facets,
    filters,
    filterCount,
    sort,
    page,
    filtered,
    sorted,
    visible,
    hasMore: visible.length < sorted.length,
    matchingCategories,
    setFilters,
    patchFilters,
    clearFilters,
    setSort,
    loadMore,
    countFor,
  };
}
