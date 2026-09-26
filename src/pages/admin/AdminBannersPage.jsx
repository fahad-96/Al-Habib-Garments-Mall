import React, { useId, useMemo, useState } from "react";
import { Image, Plus } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { pluralize } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/admin/PageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import BannerCard from "../../components/admin/catalog/BannerCard";
import BannerEditor, { PLACEMENTS } from "../../components/admin/catalog/BannerEditor";
import { LoadError } from "../../components/admin/catalog/bits";
import { nextSortOrder, useCatalogTable } from "../../components/admin/catalog/useCatalogTable";

const EMPTY_COPY = {
  hero: "No hero banners. The home page opens with its typographic hero until you add one.",
  strip: "No strip banner. The band is left out of the home page until you add one.",
};

function BannerGroup({ placement, rows, onAdd, onEdit, onDelete }) {
  const headingId = useId();
  const live = rows.filter((b) => b.isActive).length;
  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id={headingId} className="font-display text-2xl leading-none text-paper">
            {placement.label}
          </h2>
          <p className="mt-2 text-xs text-neutral-500">
            {placement.hint}
            {rows.length ? ` ${pluralize(live, "banner")} live.` : ""}
          </p>
        </div>
        <Button variant="inverse-outline" size="sm" onClick={onAdd} aria-label={`Add a ${placement.label.toLowerCase()} banner`}>
          <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          Add
        </Button>
      </div>
      {rows.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {rows.map((b, i) => (
            <BannerCard key={b.id} banner={b} index={i} onEdit={() => onEdit(b)} onDelete={() => onDelete(b)} />
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-neutral-800 px-5 py-8 text-center text-sm text-neutral-500">{EMPTY_COPY[placement.key]}</p>
      )}
    </section>
  );
}

export default function AdminBannersPage() {
  const { toast } = useShop();
  const { rows, loading, error, reload, save, remove } = useCatalogTable("banners", { noun: "banner" });
  const [editing, setEditing] = useState(null); // { item: banner | null, placement }
  const [deleting, setDeleting] = useState(null);

  const groups = useMemo(() => PLACEMENTS.map((p) => ({ ...p, rows: rows.filter((b) => b.placement === p.key) })), [rows]);
  const editorPlacement = editing?.placement || "hero";
  const editorSortOrder = useMemo(() => nextSortOrder(rows.filter((b) => b.placement === editorPlacement)), [rows, editorPlacement]);
  const hidden = rows.filter((b) => !b.isActive).length;

  const openNew = (placement = "hero") => setEditing({ item: null, placement });
  const openEdit = (item) => setEditing({ item, placement: item.placement });

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting);
    } catch (e) {
      toast(e?.message || "Could not delete the banner.", { type: "error", duration: 5000 });
    }
  };

  const description = loading
    ? "Loading the banners."
    : rows.length
      ? `${pluralize(rows.length, "banner")}${hidden ? ` · ${hidden} hidden` : ""} · The home page hero and strip`
      : "The home page hero slides and the wide strip further down.";

  let body;
  if (error) body = <LoadError what="The banners" error={error} onRetry={reload} loading={loading} />;
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
          icon={Image}
          title="No banners yet"
          description="Without banners the home page opens with a typographic hero. Import the demo catalog from the dashboard for two hero slides and a strip, or create your own."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="inverse" size="sm" to="/admin/dashboard">
                Import from the dashboard
              </Button>
              <Button variant="inverse-outline" size="sm" onClick={() => openNew()}>
                New banner
              </Button>
            </div>
          }
        />
      </div>
    );
  } else {
    body = (
      <div className="space-y-10">
        {groups.map((g) => (
          <BannerGroup key={g.key} placement={g} rows={g.rows} onAdd={() => openNew(g.key)} onEdit={openEdit} onDelete={setDeleting} />
        ))}
      </div>
    );
  }

  return (
    <>
      <Seo title="Banners" description="Manage home page banners." noindex />
      <PageHeader
        title="Banners"
        description={description}
        actions={
          <Button variant="inverse" size="sm" onClick={() => openNew()}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            New banner
          </Button>
        }
      />
      {body}

      <BannerEditor open={Boolean(editing)} item={editing?.item || null} placement={editorPlacement} defaultSortOrder={editorSortOrder} onClose={() => setEditing(null)} onSave={save} />

      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={confirmDelete} title={`Delete ${deleting?.title ? `“${deleting.title}”` : "banner"}?`} description="It leaves the home page straight away. The image stays in storage." confirmLabel="Delete" danger />
    </>
  );
}
