import React, { useCallback, useMemo, useState } from "react";
import { Plus, Tags } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { DEPARTMENTS } from "../../data/catalog";
import { pluralize } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/admin/PageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import CategoryGroup from "../../components/admin/catalog/CategoryGroup";
import CategoryEditor from "../../components/admin/catalog/CategoryEditor";
import { LoadError } from "../../components/admin/catalog/bits";
import { isReferenceError, nextSortOrder, useCatalogTable } from "../../components/admin/catalog/useCatalogTable";

export default function AdminCategoriesPage() {
  const { products, toast } = useShop();
  const { rows, loading, error, reload, save, remove } = useCatalogTable("categories", { noun: "category" });
  const [editing, setEditing] = useState(null); // { item: category | null, department }
  const [deleting, setDeleting] = useState(null);

  const counts = useMemo(() => products.reduce((map, p) => map.set(p.categoryKey, (map.get(p.categoryKey) || 0) + 1), new Map()), [products]);
  const countFor = useCallback((key) => counts.get(key) || 0, [counts]);
  const existingKeys = useMemo(() => new Set(rows.map((c) => c.key)), [rows]);
  const groups = useMemo(() => DEPARTMENTS.map((d) => ({ ...d, rows: rows.filter((c) => c.department === d.key) })), [rows]);
  const hidden = rows.filter((c) => !c.isActive).length;
  const stocked = groups.filter((g) => g.rows.length).length;

  const editorDepartment = editing?.department || "men";
  const editorSortOrder = useMemo(() => nextSortOrder(rows.filter((c) => c.department === editorDepartment)), [rows, editorDepartment]);

  const openNew = (department = "men") => setEditing({ item: null, department });
  const openEdit = (item) => setEditing({ item, department: item.department });

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting);
    } catch (e) {
      toast(isReferenceError(e) ? "Move its products to another category first." : e?.message || "Could not delete the category.", { type: "error", duration: 5000 });
    }
  };

  const description = loading
    ? "Loading the categories."
    : rows.length
      ? `${pluralize(rows.length, "category", "categories")} across ${pluralize(stocked, "department")}${hidden ? ` · ${hidden} hidden` : ""}`
      : "Categories group products inside each department.";

  const deletingCount = deleting ? countFor(deleting.key) : 0;

  let body;
  if (error) body = <LoadError what="The categories" error={error} onRetry={reload} loading={loading} />;
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
          icon={Tags}
          title="No categories yet"
          description="Import the built-in demo catalog from the dashboard to start with a full set, or create the first category by hand."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="inverse" size="sm" to="/admin/dashboard">
                Import from the dashboard
              </Button>
              <Button variant="inverse-outline" size="sm" onClick={() => openNew()}>
                New category
              </Button>
            </div>
          }
        />
      </div>
    );
  } else {
    body = (
      <div className="space-y-5">
        {groups.map((g) => (
          <CategoryGroup key={g.key} department={g} rows={g.rows} countFor={countFor} onAdd={() => openNew(g.key)} onEdit={openEdit} onDelete={setDeleting} />
        ))}
      </div>
    );
  }

  return (
    <>
      <Seo title="Categories" description="Manage store categories." noindex />
      <PageHeader
        title="Categories"
        description={description}
        actions={
          <Button variant="inverse" size="sm" onClick={() => openNew()}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            New category
          </Button>
        }
      />
      {body}

      <CategoryEditor open={Boolean(editing)} item={editing?.item || null} department={editorDepartment} existingKeys={existingKeys} defaultSortOrder={editorSortOrder} onClose={() => setEditing(null)} onSave={save} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleting?.name || "category"}?`}
        description={
          deletingCount
            ? `${pluralize(deletingCount, "product")} on the store still point at it. The database will refuse until they are moved to another category.`
            : "It disappears from the store and the admin. Products are not touched."
        }
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
