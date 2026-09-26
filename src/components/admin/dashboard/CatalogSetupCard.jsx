import React, { useState } from "react";
import { Download } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";
import { useShop } from "../../../context/ShopContext";
import { seedDummyData } from "../../../lib/adminApi";
import { BANNERS, CATEGORIES, COLLECTIONS, PRODUCTS, SIZE_GUIDES } from "../../../data/catalog";
import { pluralize } from "../../../lib/format";
import Button from "../../ui/Button";

const DUMMY = { products: PRODUCTS, categories: CATEGORIES, banners: BANNERS, collections: COLLECTIONS, sizeGuides: SIZE_GUIDES };

const summarise = (counts) => {
  const parts = [
    [counts.products, "product"],
    [counts.categories, "category", "categories"],
    [counts.banners, "banner"],
    [counts.collections, "collection"],
    [counts.sizeGuides, "size guide"],
  ]
    .filter(([n]) => n > 0)
    .map(([n, one, many]) => pluralize(n, one, many));
  return parts.length ? `Imported ${parts.join(", ")}.` : "Nothing to add. Everything from the built-in catalog is already in the database.";
};

// One-click import of the built-in catalog. Safe to run more than once: the
// import only inserts slugs that are missing, so edited rows are never touched.
export default function CatalogSetupCard({ liveCount = 0, onImported, className = "" }) {
  const { supabase } = useAdmin();
  const { toast, refreshCatalog } = useShop();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const hasProducts = liveCount > 0;

  const runImport = async () => {
    if (!supabase || importing) return;
    setImporting(true);
    setError("");
    setResult("");
    setProgress({ categories: 0, products: 0, banners: 0, collections: 0, sizeGuides: 0 });
    try {
      const counts = await seedDummyData(supabase, DUMMY, (c) => setProgress({ ...c }));
      const summary = summarise(counts);
      setResult(summary);
      toast(summary, { type: "success", duration: 5000 });
      await Promise.resolve(refreshCatalog?.());
      onImported?.(counts);
    } catch (e) {
      setError(e?.message || "The import stopped part-way. Run it again to add whatever is still missing.");
    } finally {
      setImporting(false);
      setProgress(null);
    }
  };

  return (
    <section className={`admin-card ${className}`}>
      <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow-dark">Catalog setup</p>
          <h2 className="mt-2 font-display text-2xl leading-none text-paper">
            {hasProducts ? pluralize(liveCount, "product") : "No products"} in the database
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            {hasProducts
              ? `The storefront is showing the live catalog. Importing again only adds items whose slug is missing (the built-in set has ${PRODUCTS.length} products), so anything you have edited stays exactly as it is.`
              : `The storefront is showing the built-in catalog until the database has at least one product. Import it to start editing prices, photos and stock from here, then delete what you do not sell.`}
          </p>
          <p className="mt-3 min-h-[1.25rem] text-xs text-neutral-500" aria-live="polite">
            {importing && progress
              ? `Importing: ${progress.products} of ${PRODUCTS.length} products, ${progress.categories} of ${CATEGORIES.length} categories.`
              : error || result}
          </p>
        </div>
        <div className="shrink-0">
          <Button variant={hasProducts ? "inverse-outline" : "inverse"} size="md" onClick={runImport} loading={importing} className="w-full lg:w-auto">
            {!importing && <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
            {importing ? "Importing" : "Import dummy catalog"}
          </Button>
        </div>
      </div>
    </section>
  );
}
