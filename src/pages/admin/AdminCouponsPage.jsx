import React, { useMemo, useState } from "react";
import { Plus, Ticket } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { pluralize } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/admin/PageHeader";
import DataTable from "../../components/admin/DataTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { ErrorCard } from "../../components/admin/config/ConfigCard";
import { useConfigTable } from "../../components/admin/config/useConfigTable";
import { couponColumns } from "../../components/admin/config/couponColumns";
import MobileCouponList from "../../components/admin/config/MobileCouponList";
import CouponModal from "../../components/admin/config/CouponModal";
import { compareCoupons, couponStatus } from "../../components/admin/config/couponUtils";

const summaryFor = (rows) => {
  if (!rows.length) return "Codes customers type in their bag for a discount. Nothing has been created yet.";
  const counts = rows.reduce((acc, c) => {
    const s = couponStatus(c);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const parts = [`${counts.active || 0} active`];
  if (counts.scheduled) parts.push(`${counts.scheduled} scheduled`);
  if (counts.expired) parts.push(`${counts.expired} expired`);
  if (counts.exhausted) parts.push(`${counts.exhausted} exhausted`);
  if (counts.inactive) parts.push(`${counts.inactive} switched off`);
  return `${pluralize(rows.length, "coupon")} · ${parts.join(" · ")}`;
};

export default function AdminCouponsPage() {
  const { toast } = useShop();
  const { rows, loading, error, reload, save, remove, firstLoad } = useConfigTable("coupons", { sortBy: compareCoupons });

  const [editing, setEditing] = useState(null);
  const [editorKey, setEditorKey] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const openEditor = (coupon = null) => {
    setEditing(coupon || {});
    setEditorKey((k) => k + 1);
  };
  const closeEditor = () => setEditing(null);

  const handleSave = async (item) => {
    const saved = await save(item);
    closeEditor();
    toast(item.id ? `${saved.code} updated.` : `${saved.code} is ready to use.`, { type: "success" });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      toast(`${deleting.code} deleted.`, { type: "success" });
    } catch (e) {
      toast(e?.message || "The coupon could not be deleted.", { type: "error", duration: 5000 });
    }
  };

  const columns = useMemo(() => couponColumns({ onEdit: openEditor, onDelete: setDeleting }), []);
  const failedCold = Boolean(error) && rows.length === 0;
  const nothingYet = !firstLoad && !error && rows.length === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <Seo title="Coupons" noindex />
      <PageHeader
        title="Coupons"
        description={firstLoad ? "Loading coupons." : summaryFor(rows)}
        actions={
          <Button variant="inverse" size="sm" onClick={() => openEditor()}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            New coupon
          </Button>
        }
      />

      {error && <ErrorCard className="mb-6" title="Coupons could not load." message={error} onRetry={reload} loading={loading} />}

      {nothingYet ? (
        <div className="admin-card">
          <EmptyState
            dark
            icon={Ticket}
            title="No coupons yet"
            description="Create a code like WELCOME10 for first orders, or a flat amount off for festival weeks. Coupons are checked on the server when a customer applies them in the bag."
            action={
              <Button variant="inverse" size="sm" onClick={() => openEditor()}>
                Create the first coupon
              </Button>
            }
          />
        </div>
      ) : failedCold ? null : (
        <div className={`[contain:inline-size] transition-opacity duration-300 ${loading && rows.length ? "opacity-60" : ""}`} aria-busy={loading}>
          <MobileCouponList className="sm:hidden" rows={rows} loading={firstLoad} onEdit={openEditor} onDelete={setDeleting} />
          <div className="hidden sm:block">
            <DataTable columns={columns} rows={rows} loading={firstLoad} empty="No coupons." onRowClick={openEditor} />
          </div>
          {!firstLoad && rows.length > 0 && <p className="mt-3 text-xs text-neutral-500">Coupons are never shown on the store. Share the code on WhatsApp or in the announcement bar.</p>}
        </div>
      )}

      <CouponModal key={editorKey} open={Boolean(editing)} coupon={editing} existing={rows} onClose={closeEditor} onSave={handleSave} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleting?.code || "coupon"}?`}
        description="Customers will no longer be able to apply it. Orders that already used it are not affected. This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
