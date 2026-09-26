import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, SearchX } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useShop } from "../../context/ShopContext";
import { bulkDeleteProducts, bulkSetProductsActive, fetchAdminProducts } from "../../lib/adminApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useDebounce } from "../../hooks/useDebounce";
import { pluralize } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/admin/PageHeader";
import DataTable from "../../components/admin/DataTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import ProductsToolbar, { EMPTY_PRODUCT_FILTERS, hasActiveFilters } from "../../components/admin/products/ProductsToolbar";
import BulkBar from "../../components/admin/products/BulkBar";
import MobileProductList from "../../components/admin/products/MobileProductList";
import { productColumns } from "../../components/admin/products/productColumns";

export default function AdminProductsPage() {
  const { supabase } = useAdmin();
  const { categories, toast, refreshCatalog } = useShop();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(EMPTY_PRODUCT_FILTERS);
  const search = useDebounce(filters.search.trim(), 300);
  const { status, department, categoryKey } = filters;

  const loader = useCallback(
    () => (supabase ? fetchAdminProducts(supabase, { search, status, department, categoryKey }) : Promise.resolve([])),
    [supabase, search, status, department, categoryKey]
  );
  const { data, loading, error, reload } = useAsyncData(loader);
  const rows = useMemo(() => data || [], [data]);

  const [selected, setSelected] = useState(() => new Set());
  const [busy, setBusy] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Drop selections that no longer exist after a reload or filter change.
  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(rows.map((r) => r.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = (checked) => setSelected(checked ? new Set(rows.map((r) => r.id)) : new Set());

  const runBulk = async (kind, action, describe) => {
    const ids = [...selected];
    if (!ids.length || !supabase) return;
    setBusy(kind);
    try {
      const done = await action(ids);
      toast(describe(done?.length ?? ids.length), { type: "success" });
      setSelected(new Set());
      reload();
      refreshCatalog?.();
    } catch (e) {
      toast(e?.message || "Something went wrong.", { type: "error", duration: 5000 });
    } finally {
      setBusy("");
    }
  };
  const activate = () => runBulk("activate", (ids) => bulkSetProductsActive(supabase, ids, true), (n) => `${pluralize(n, "product")} now visible on the store.`);
  const hide = () => runBulk("hide", (ids) => bulkSetProductsActive(supabase, ids, false), (n) => `${pluralize(n, "product")} hidden from the store.`);
  const remove = () => runBulk("delete", (ids) => bulkDeleteProducts(supabase, ids), (n) => `${pluralize(n, "product")} deleted.`);

  const categoryName = useCallback((key) => categories.find((c) => c.key === key)?.name || "", [categories]);
  const columns = useMemo(() => productColumns(categoryName), [categoryName]);

  const filtered = hasActiveFilters(filters);
  const hidden = rows.filter((r) => r.isActive === false).length;
  const description =
    loading && !data
      ? "Loading the catalog."
      : rows.length === 0
        ? filtered
          ? "Nothing matches these filters."
          : "No products in the database yet."
        : `${pluralize(rows.length, "product")}${filtered ? " match" : ""}${hidden ? ` · ${hidden} hidden` : ""}`;

  let body;
  if (error) {
    body = (
      <div className="admin-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
        <div>
          <p className="text-sm text-paper">The products could not load.</p>
          <p className="mt-1 text-xs text-neutral-400">{error}</p>
        </div>
        <Button variant="inverse-outline" size="sm" onClick={reload} loading={loading}>
          Try again
        </Button>
      </div>
    );
  } else if (data && rows.length === 0 && !loading) {
    body = (
      <div className="admin-card">
        {filtered ? (
          <EmptyState
            dark
            icon={SearchX}
            title="Nothing matches"
            description="Try a different search, or clear the filters to see the whole catalog."
            action={
              <Button variant="inverse-outline" size="sm" onClick={() => setFilters(EMPTY_PRODUCT_FILTERS)}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            dark
            icon={Package}
            title="No products yet"
            description="Import the built-in demo catalog from the dashboard to start with a full, editable range, or add your first product by hand."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="inverse" size="sm" to="/admin/dashboard">
                  Import from the dashboard
                </Button>
                <Button variant="inverse-outline" size="sm" to="/admin/products/new">
                  New product
                </Button>
              </div>
            }
          />
        )}
      </div>
    );
  } else {
    body = (
      // contain:inline-size keeps the table's intrinsic width from widening the admin grid column (it scrolls inside its card instead).
      <div className={`[contain:inline-size] transition-opacity duration-300 ${loading && data ? "opacity-60" : ""}`} aria-busy={loading}>
        <MobileProductList className="sm:hidden" rows={rows} loading={loading && !data} selected={selected} onToggle={toggle} onToggleAll={toggleAll} categoryName={categoryName} />
        <div className="hidden sm:block">
          <DataTable columns={columns} rows={rows} loading={loading && !data} selectable selected={selected} onToggle={toggle} onToggleAll={toggleAll} onRowClick={(row) => navigate(`/admin/products/${row.id}`)} empty="No products." />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Seo title="Products" noindex />
      <PageHeader
        title="Products"
        description={description}
        actions={
          <Button variant="inverse" size="sm" to="/admin/products/new">
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            New product
          </Button>
        }
      />
      <ProductsToolbar filters={filters} onChange={setFilters} categories={categories} />
      <BulkBar count={selected.size} busy={busy} onActivate={activate} onHide={hide} onDelete={() => setConfirmDelete(true)} onClear={() => setSelected(new Set())} />
      {body}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title={`Delete ${pluralize(selected.size, "product")}?`}
        description="They will be removed from the store and the admin. Past orders keep their own copy of the details. This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
