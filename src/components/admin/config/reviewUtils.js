// Pure helpers for the reviews admin.
export const REVIEW_TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "all", label: "All" },
];
export const isReviewTab = (key) => REVIEW_TABS.some((t) => t.key === key);

export const countReviews = (rows) => ({
  pending: rows.filter((r) => !r.isApproved).length,
  approved: rows.filter((r) => r.isApproved).length,
  all: rows.length,
});

export const filterReviews = (rows, status) => {
  if (status === "pending") return rows.filter((r) => !r.isApproved);
  if (status === "approved") return rows.filter((r) => r.isApproved);
  return rows;
};

// The storefront catalog only lists active products; a review of a hidden one still resolves by slug.
export const productForReview = (review, products = []) =>
  products.find((p) => String(p.id) === String(review.productId)) || (review.productSlug ? products.find((p) => p.slug === review.productSlug) : null) || null;

export const humanizeSlug = (slug) =>
  String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const reviewsSummary = (counts) => {
  if (!counts.all) return "Reviews customers write on product pages wait here until you approve them.";
  if (!counts.pending) return `${counts.all} ${counts.all === 1 ? "review" : "reviews"}, all looked at. Nothing is waiting.`;
  return `${counts.pending} ${counts.pending === 1 ? "review is" : "reviews are"} waiting for approval. ${counts.approved} live on the store.`;
};
