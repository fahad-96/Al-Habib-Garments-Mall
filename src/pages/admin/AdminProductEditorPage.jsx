import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useShop } from "../../context/ShopContext";
import { fetchAdminProducts } from "../../lib/adminApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import { departmentName } from "../../data/catalog";
import { timeAgo } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/admin/PageHeader";
import ProductForm from "../../components/admin/products/ProductForm";
import { blankProduct } from "../../components/admin/products/productEditor";

const Block = ({ className = "" }) => <div className={`animate-pulse bg-neutral-900 ${className}`} aria-hidden="true" />;

function EditorSkeleton() {
  return (
    <div role="status" aria-label="Loading product" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_296px] xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        {[3, 2, 1].map((fields, i) => (
          <div key={i} className="admin-card">
            <div className="border-b border-neutral-800 px-5 py-4">
              <Block className="h-4 w-24" />
            </div>
            <div className="space-y-5 p-5">
              {Array.from({ length: fields }).map((_, f) => (
                <div key={f}>
                  <Block className="h-2.5 w-16" />
                  <Block className="mt-2 h-11 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="admin-card p-5">
        <Block className="h-4 w-24" />
        <Block className="mt-6 h-3 w-full" />
        <Block className="mt-3 h-3 w-2/3" />
        <Block className="mt-8 h-12 w-full" />
      </div>
    </div>
  );
}

export default function AdminProductEditorPage() {
  const { id } = useParams();
  const { supabase } = useAdmin();
  const { categories } = useShop();
  const isNew = !id;
  const [justSaved, setJustSaved] = useState(null);

  const loader = useCallback(async () => {
    if (isNew || !supabase) return null;
    const all = await fetchAdminProducts(supabase);
    return all.find((p) => String(p.id) === String(id)) || null;
  }, [supabase, id, isNew]);
  const { data, loading, error, reload } = useAsyncData(loader);

  const initial = useMemo(() => {
    if (isNew) return blankProduct(categories);
    // The last save is at least as fresh as the fetched row, so it wins while both describe this id.
    if (justSaved && String(justSaved.id) === String(id)) return justSaved;
    if (data && String(data.id) === String(id)) return data;
    return null;
  }, [isNew, data, justSaved, id, categories]);

  const category = initial ? categories.find((c) => c.key === initial.categoryKey) : null;
  const eyebrow = isNew ? "Products" : [departmentName(initial?.department), category?.name].filter(Boolean).join(" · ") || "Product";
  const title = isNew ? "New product" : initial?.title || "Product";
  const description = isNew
    ? "Fill in the basics, add at least one colour with stock, then save."
    : initial
      ? `/product/${initial.slug}${initial.updatedAt ? ` · Updated ${timeAgo(initial.updatedAt)}` : initial.createdAt ? ` · Added ${timeAgo(initial.createdAt)}` : ""}`
      : "";

  let body;
  if (initial) {
    body = <ProductForm key={initial.id || "new"} initial={initial} categories={categories} onSaved={setJustSaved} />;
  } else if (error) {
    body = (
      <div className="admin-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
        <div>
          <p className="text-sm text-paper">The product could not load.</p>
          <p className="mt-1 text-xs text-neutral-400">{error}</p>
        </div>
        <Button variant="inverse-outline" size="sm" onClick={reload} loading={loading}>
          Try again
        </Button>
      </div>
    );
  } else if (loading) {
    body = <EditorSkeleton />;
  } else {
    body = (
      <div className="admin-card">
        <EmptyState
          dark
          icon={PackageSearch}
          title="Product not found"
          description="It may have been deleted, or the link is from an older catalog."
          action={
            <Button variant="inverse" size="sm" to="/admin/products">
              Back to products
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-24 lg:pb-0">
      <Seo title={isNew ? "New product" : `Edit ${initial?.title || "product"}`} noindex />
      <PageHeader backTo="/admin/products" backLabel="Products" eyebrow={eyebrow} title={title} description={description} />
      {body}
    </div>
  );
}
