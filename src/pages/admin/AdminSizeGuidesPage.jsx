import React, { useCallback, useState } from "react";
import { Plus, Ruler } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { pluralize } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import PageHeader from "../../components/admin/PageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { ErrorCard } from "../../components/admin/config/ConfigCard";
import { useConfigTable } from "../../components/admin/config/useConfigTable";
import SizeGuideList from "../../components/admin/config/SizeGuideList";
import SizeGuideModal from "../../components/admin/config/SizeGuideModal";
import { compareGuides } from "../../components/admin/config/sizeGuideUtils";

export default function AdminSizeGuidesPage() {
  const { toast, refreshCatalog } = useShop();
  const { rows, loading, error, reload, save, remove, firstLoad } = useConfigTable("size_guides", { sortBy: compareGuides });

  const [editing, setEditing] = useState(null);
  const [editorKey, setEditorKey] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const openEditor = useCallback((guide = null) => {
    setEditing(guide || {});
    setEditorKey((k) => k + 1);
  }, []);
  const closeEditor = () => setEditing(null);

  const handleSave = async (item) => {
    const saved = await save(item);
    closeEditor();
    toast(item.id ? `${saved.title} updated.` : `${saved.title} added.`, { type: "success" });
    refreshCatalog?.();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      toast(`${deleting.title} deleted.`, { type: "success" });
      refreshCatalog?.();
    } catch (e) {
      toast(e?.message || "The guide could not be deleted.", { type: "error", duration: 5000 });
    }
  };

  const failedCold = Boolean(error) && rows.length === 0;
  const nothingYet = !firstLoad && !error && rows.length === 0;
  const description = firstLoad ? "Loading size guides." : rows.length ? `${pluralize(rows.length, "guide")}. Each product page shows the guide that matches its size set and department.` : "Charts that help customers pick a size. Shown on product pages and at /size-guide.";

  return (
    <div className="mx-auto max-w-6xl">
      <Seo title="Size guides" noindex />
      <PageHeader
        title="Size guides"
        description={description}
        actions={
          <Button variant="inverse" size="sm" onClick={() => openEditor()}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            New guide
          </Button>
        }
      />

      {error && <ErrorCard className="mb-6" title="Size guides could not load." message={error} onRetry={reload} loading={loading} />}

      {firstLoad ? (
        <div className="admin-card">
          <Spinner label="Loading size guides" />
        </div>
      ) : nothingYet ? (
        <div className="admin-card">
          <EmptyState
            dark
            icon={Ruler}
            title="No size guides yet"
            description="Import the demo catalog from the dashboard to start with charts for apparel, waist sizes and kids, or write your first one here."
            action={
              <Button variant="inverse" size="sm" onClick={() => openEditor()}>
                Create the first guide
              </Button>
            }
          />
        </div>
      ) : failedCold ? null : (
        <div className={`transition-opacity duration-300 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
          <SizeGuideList guides={rows} onEdit={openEditor} onDelete={setDeleting} />
        </div>
      )}

      <SizeGuideModal key={editorKey} open={Boolean(editing)} guide={editing} existing={rows} onClose={closeEditor} onSave={handleSave} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleting?.title || "this guide"}?`}
        description="Products that used it will fall back to another guide with the same size set, or show no chart. This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
