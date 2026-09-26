import React, { useCallback, useMemo, useState } from "react";
import { Layers, Plus } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { pluralize } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/admin/PageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import CollectionCard from "../../components/admin/catalog/CollectionCard";
import CollectionEditor from "../../components/admin/catalog/CollectionEditor";
import { LoadError } from "../../components/admin/catalog/bits";
import { nextSortOrder, useCatalogTable } from "../../components/admin/catalog/useCatalogTable";

export default function AdminCollectionsPage() {
  const { products, toast } = useShop();
  const { rows, loading, error, reload, save, remove } = useCatalogTable("collections", { noun: "collection" });
  const [editing, setEditing] = useState(null); // { item: collection | null }
  const [deleting, setDeleting] = useState(null);

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const resolve = useCallback((c) => (c.productSlugs || []).map((s) => bySlug.get(s)).filter(Boolean), [bySlug]);
  const defaultSortOrder = useMemo(() => nextSortOrder(rows), [rows]);
  const hidden = rows.filter((c) => !c.isActive).length;

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting);
    } catch (e) {
      toast(e?.message || "Could not delete the collection.", { type: "error", duration: 5000 });
    }
  };

  const description = loading
    ? "Loading the collections."
    : rows.length
      ? `${pluralize(rows.length, "collection")}${hidden ? ` · ${hidden} hidden` : ""} · Hand-picked edits shown at /collections`
      : "Hand-picked edits, shown at /collections and featured on the home page.";

  let body;
  if (error) body = <LoadError what="The collections" error={error} onRetry={reload} loading={loading} />;
  else if (loading) {
    body = (
      <div className="admin-card">
        <Spinner />
      </div>
    );
  } else if (!rows.length) {
    body = (
      <div className="admin-card">
        <EmptyState
          dark
          icon={Layers}
          title="No collections yet"
          description="A collection is an ordered edit of products, like Winter Layers or Everyday Essentials. Import the demo catalog from the dashboard, or start one from scratch."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="inverse" size="sm" to="/admin/dashboard">
                Import from the dashboard
              </Button>
              <Button variant="inverse-outline" size="sm" onClick={() => setEditing({ item: null })}>
                New collection
              </Button>
            </div>
          }
        />
      </div>
    );
  } else {
    body = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {rows.map((c) => (
          <CollectionCard key={c.id} collection={c} products={resolve(c)} onEdit={() => setEditing({ item: c })} onDelete={() => setDeleting(c)} />
        ))}
      </div>
    );
  }

  return (
    <>
      <Seo title="Collections" description="Manage store collections." noindex />
      <PageHeader
        title="Collections"
        description={description}
        actions={
          <Button variant="inverse" size="sm" onClick={() => setEditing({ item: null })}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            New collection
          </Button>
        }
      />
      {body}

      <CollectionEditor open={Boolean(editing)} item={editing?.item || null} existing={rows} defaultSortOrder={defaultSortOrder} onClose={() => setEditing(null)} onSave={save} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleting?.name || "collection"}?`}
        description="The collection page disappears from the store. The products in it are not touched."
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
