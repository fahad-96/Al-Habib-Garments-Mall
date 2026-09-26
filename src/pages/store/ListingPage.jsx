import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import Seo from "../../components/ui/Seo";
import { useListing } from "../../components/store/listing/useListing";
import ListingHeader from "../../components/store/listing/ListingHeader";
import CollectionHero from "../../components/store/listing/CollectionHero";
import CategoryRail from "../../components/store/listing/CategoryRail";
import FilterSidebar from "../../components/store/listing/FilterSidebar";
import FilterDrawer from "../../components/store/listing/FilterDrawer";
import SortSelect, { SortDrawer } from "../../components/store/listing/SortMenu";
import ActiveFilters from "../../components/store/listing/ActiveFilters";
import MobileBar from "../../components/store/listing/MobileBar";
import ProductGrid, { ProductGridSkeleton } from "../../components/store/listing/ProductGrid";
import EmptyListing from "../../components/store/listing/EmptyListing";

const HOME = { label: "Home", to: "/" };
const SHOP = { label: "Shop", to: "/shop" };

const metaFor = ({ mode, q, department, category, collection }) => {
  switch (mode) {
    case "department":
      return department
        ? { crumbs: [HOME, SHOP, { label: department.name }], eyebrow: "Shop", title: department.name, description: department.tagline, seo: { title: department.name, description: `${department.tagline} ${department.name} at Al Habib Garments Mall, Kunzer.` } }
        : { crumbs: [HOME, SHOP], eyebrow: "Shop", title: "Not found", seo: { title: "Department not found" } };
    case "category":
      if (!department) return { crumbs: [HOME, SHOP], eyebrow: "Shop", title: "Not found", seo: { title: "Category not found" } };
      if (!category) return { crumbs: [HOME, SHOP, { label: department.name, to: `/shop/${department.key}` }], eyebrow: department.name, title: "Not found", seo: { title: "Category not found" } };
      return {
        crumbs: [HOME, SHOP, { label: department.name, to: `/shop/${department.key}` }, { label: category.name }],
        eyebrow: department.name,
        title: category.name,
        description: category.description,
        seo: { title: `${department.name} ${category.name}`, description: category.description || `${category.name} for ${department.name.toLowerCase()} at Al Habib Garments Mall, Kunzer.` },
      };
    case "new":
      return { crumbs: [HOME, { label: "New in" }], eyebrow: "Just in", title: "New in", description: "The latest pieces to reach the shop floor in Kunzer, across men, women and kids.", seo: { title: "New in", description: "The newest arrivals at Al Habib Garments Mall: jackets, hoodies, tees, track pants, bags and more." } };
    case "sale":
      return { crumbs: [HOME, { label: "Sale" }], eyebrow: "Reduced", title: "Sale", description: "Marked-down pieces across the store. The price you see is the price you pay.", seo: { title: "Sale", description: "Reduced prices on jackets, hoodies, tees, track pants, bags and accessories." } };
    case "search":
      return {
        crumbs: [HOME, { label: "Search" }],
        eyebrow: "Search",
        title: q ? <span className="italic">“{q}”</span> : "Search",
        seo: { title: q ? `Search: ${q}` : "Search", description: q ? `Results for “${q}” at Al Habib Garments Mall.` : "Search the store.", noindex: true },
      };
    case "collection":
      return collection
        ? { crumbs: [], seo: { title: collection.name, description: collection.description, image: collection.imageUrl } }
        : { crumbs: [HOME, { label: "Collections", to: "/collections" }], eyebrow: "Collections", title: "Not found", seo: { title: "Collection not found" } };
    default:
      return { crumbs: [HOME, { label: "Shop" }], eyebrow: "Shop", title: "Everything", description: "Every piece in the store: menswear, womenswear and kidswear from Kunzer, Tangmarg.", seo: { title: "Shop all", description: "Browse the full range at Al Habib Garments Mall: jackets, hoodies, tees, track pants, leggings, bags and beanies." } };
  }
};

export default function ListingPage({ mode = "all" }) {
  const listing = useListing(mode);
  const { q, department, category, collection, categories, categoriesFor, catalogReady, base, facets, filters, filterCount, sort, sorted, visible, hasMore, matchingCategories, setFilters, patchFilters, clearFilters, setSort, loadMore, countFor } = listing;
  const { setSearchOpen } = useShop();
  const location = useLocation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // The same page component serves every listing route; close any sheet when the route changes.
  useEffect(() => {
    setFilterOpen(false);
    setSortOpen(false);
  }, [location.pathname]);

  const meta = useMemo(() => metaFor({ mode, q, department, category, collection }), [mode, q, department, category, collection]);
  const siblingCategories = useMemo(() => (department ? categoriesFor(department.key) : []), [department, categoriesFor]);
  const notFound = (mode === "department" && !department) || (mode === "category" && (!department || !category)) || (mode === "collection" && !collection);
  const showHero = mode === "collection" && Boolean(collection);
  const baseEmpty = catalogReady && base.length === 0;
  const count = catalogReady ? sorted.length : null;

  return (
    <div className="pb-20 lg:pb-28">
      <Seo title={meta.seo.title} description={meta.seo.description} image={meta.seo.image} noindex={meta.seo.noindex} />

      {showHero && <CollectionHero collection={collection} count={base.length} ready={catalogReady} />}

      <div className="container">
        {!showHero && <ListingHeader className="pt-6 sm:pt-10" crumbs={meta.crumbs} eyebrow={meta.eyebrow} title={meta.title} description={meta.description} count={notFound ? null : count} ready={catalogReady} />}

        {mode === "department" && department && <CategoryRail className="mt-6 sm:mt-8" department={department} categories={siblingCategories} />}
        {mode === "category" && department && category && <CategoryRail className="mt-6 sm:mt-8 lg:hidden" department={department} categories={siblingCategories} current={category.key} />}

        {mode === "search" && matchingCategories.length > 0 && (
          <nav className="mt-6 sm:mt-8" aria-label="Matching categories">
            <p className="eyebrow">Categories</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {matchingCategories.map((c) => (
                <li key={c.key}>
                  <Link to={`/shop/${c.department}/${c.slug}`} className="chip">
                    <span className="mr-1.5 font-normal text-neutral-500">{c.department === "kids" ? "Kids" : c.department === "women" ? "Women" : "Men"}</span>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {notFound || baseEmpty ? (
          <div className="mt-6 border-t border-line">
            <EmptyListing mode={mode} q={q} department={department} category={category} collection={collection} onClear={clearFilters} onSearch={() => setSearchOpen(true)} />
          </div>
        ) : (
          <div className={`mt-8 lg:mt-12 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 xl:gap-16`}>
            <FilterSidebar mode={mode} filters={filters} facets={facets} filterCount={filterCount} onChange={patchFilters} onClear={clearFilters} department={department} category={category} siblingCategories={siblingCategories} />

            <div className="min-w-0">
              <MobileBar filterCount={filterCount} sort={sort} onFilter={() => setFilterOpen(true)} onSort={() => setSortOpen(true)} count={count} ready={catalogReady} />

              <div className="hidden items-center justify-between gap-6 border-b border-line pb-4 lg:flex">
                <p className="text-sm text-neutral-500" aria-live="polite">
                  {catalogReady ? (
                    <>
                      <span className="font-medium tabular-nums text-ink">{sorted.length}</span> {sorted.length === 1 ? "item" : "items"}
                    </>
                  ) : (
                    "Loading"
                  )}
                </p>
                <SortSelect value={sort} onChange={setSort} />
              </div>

              <ActiveFilters filters={filters} categories={categories} onChange={patchFilters} onClear={clearFilters} className="mt-4 lg:mt-5" />

              <div className="mt-6 lg:mt-8">
                {!catalogReady ? (
                  <ProductGridSkeleton />
                ) : sorted.length === 0 ? (
                  <EmptyListing mode={mode} filtered onClear={clearFilters} />
                ) : (
                  <ProductGrid products={visible} total={sorted.length} hasMore={hasMore} onLoadMore={loadMore} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} mode={mode} filters={filters} facets={facets} countFor={countFor} onApply={setFilters} department={department} category={category} siblingCategories={siblingCategories} />
      <SortDrawer open={sortOpen} onClose={() => setSortOpen(false)} value={sort} onChange={setSort} />
    </div>
  );
}
