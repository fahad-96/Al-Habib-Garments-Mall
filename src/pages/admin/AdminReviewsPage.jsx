import React, { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCheck, MessageSquare, RefreshCw, Star } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useShop } from "../../context/ShopContext";
import { deleteReview, fetchAdminReviews, setReviewApproved } from "../../lib/adminApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import PageHeader from "../../components/admin/PageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import Tabs from "../../components/admin/config/Tabs";
import { ErrorCard } from "../../components/admin/config/ConfigCard";
import ReviewCard from "../../components/admin/config/ReviewCard";
import { countReviews, filterReviews, isReviewTab, productForReview, REVIEW_TABS, reviewsSummary } from "../../components/admin/config/reviewUtils";

const NONE = [];

const EMPTY = {
  pending: { icon: CheckCheck, title: "Nothing waiting", description: "Every review has been looked at. New ones appear here the moment a customer submits them." },
  approved: { icon: Star, title: "No approved reviews yet", description: "Approve a pending review and it shows on the product page with the customer's name and rating." },
  all: { icon: MessageSquare, title: "No reviews yet", description: "Customers can rate and review a product from its page. Reviews wait here for approval before they show on the store." },
};

export default function AdminReviewsPage() {
  const { supabase } = useAdmin();
  const { products, toast } = useShop();
  const [params, setParams] = useSearchParams();
  const status = isReviewTab(params.get("status")) ? params.get("status") : "pending";

  // One fetch of everything: tabs switch instantly and every count is exact.
  const loader = useCallback(() => (supabase ? fetchAdminReviews(supabase, { status: "all" }) : Promise.resolve(NONE)), [supabase]);
  const { data, setData, loading, error, reload } = useAsyncData(loader);
  const reviews = data || NONE;
  const counts = useMemo(() => countReviews(reviews), [reviews]);
  const rows = useMemo(() => filterReviews(reviews, status), [reviews, status]);

  const [busy, setBusy] = useState({});
  const [deleting, setDeleting] = useState(null);

  const setStatus = (key) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === "pending") next.delete("status");
      else next.set("status", key);
      return next;
    });

  const mark = (id, kind) =>
    setBusy((b) => {
      const next = { ...b };
      if (kind) next[id] = kind;
      else delete next[id];
      return next;
    });

  const toggleApproved = async (review) => {
    if (!supabase) return;
    mark(review.id, "approve");
    try {
      const saved = await setReviewApproved(supabase, review.id, !review.isApproved);
      setData((prev) => (prev || []).map((r) => (r.id === saved.id ? saved : r)));
      toast(saved.isApproved ? "Approved. It now shows on the product page." : "Hidden from the store.", { type: "success" });
    } catch (e) {
      toast(e?.message || "The review could not be updated.", { type: "error", duration: 5000 });
    } finally {
      mark(review.id, "");
    }
  };

  const handleDelete = async () => {
    if (!deleting || !supabase) return;
    try {
      await deleteReview(supabase, deleting.id);
      setData((prev) => (prev || []).filter((r) => r.id !== deleting.id));
      toast("Review deleted.", { type: "success" });
    } catch (e) {
      toast(e?.message || "The review could not be deleted.", { type: "error", duration: 5000 });
    }
  };

  const firstLoad = loading && !data;
  const failedCold = Boolean(error) && reviews.length === 0;
  const empty = EMPTY[status];

  return (
    <div className="mx-auto max-w-6xl">
      <Seo title="Reviews" noindex />
      <PageHeader
        title="Reviews"
        description={firstLoad ? "Loading reviews." : reviewsSummary(counts)}
        actions={
          <Button variant="inverse-outline" size="sm" onClick={reload} loading={loading && Boolean(data)} disabled={loading}>
            {!(loading && data) && <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />}
            Refresh
          </Button>
        }
      />

      {error && <ErrorCard className="mb-6" title="Reviews could not load." message={error} onRetry={reload} loading={loading} />}

      {failedCold ? null : (
        <>
          <div className="mb-5 border-b border-neutral-800">
            <Tabs tabs={REVIEW_TABS} value={status} counts={data ? counts : {}} onChange={setStatus} label="Filter reviews" />
          </div>

          {firstLoad ? (
            <div className="admin-card">
              <Spinner label="Loading reviews" />
            </div>
          ) : rows.length === 0 ? (
            <div className="admin-card">
              <EmptyState dark icon={empty.icon} title={empty.title} description={empty.description} />
            </div>
          ) : (
            <ul className={`grid gap-4 lg:grid-cols-2 transition-opacity duration-300 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
              {rows.map((review) => (
                <li key={review.id} className="min-w-0">
                  <ReviewCard review={review} product={productForReview(review, products)} busy={busy[review.id] || ""} onApprove={() => toggleApproved(review)} onDelete={() => setDeleting(review)} />
                </li>
              ))}
            </ul>
          )}

          {!firstLoad && reviews.length >= 500 && <p className="mt-3 text-xs text-neutral-500">Showing the most recent 500 reviews.</p>}
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete this review?"
        description={`${deleting?.name || "The customer"}'s ${deleting?.rating || ""}-star review will be removed for good. To simply hide it from the store, unapprove it instead.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
