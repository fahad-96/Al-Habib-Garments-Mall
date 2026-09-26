import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Button from "../../ui/Button";
import Stars from "../../ui/Stars";
import StatusPill from "../StatusPill";
import { formatDate } from "../../../lib/format";
import { textButton } from "./ConfigCard";
import { humanizeSlug } from "./reviewUtils";

const CLAMP_AT = 320;

// Stars is drawn for white pages; these arbitrary variants flip it for the dark admin.
export function DarkStars(props) {
  return (
    <span className="inline-flex [&_.fill-ink]:fill-paper [&_.text-ink]:text-paper [&_.text-neutral-300]:text-neutral-600">
      <Stars {...props} />
    </span>
  );
}

export default function ReviewCard({ review, product, busy = "", onApprove, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const long = (review.body || "").length > CLAMP_AT;
  const productLabel = product?.title || humanizeSlug(review.productSlug) || "Product no longer listed";

  return (
    <article className="admin-card flex flex-col" aria-busy={Boolean(busy)}>
      <header className="flex items-start justify-between gap-3 border-b border-neutral-800 px-5 py-3.5">
        <div className="min-w-0">
          <p className="eyebrow-dark">Product</p>
          {product ? (
            <Link to={`/product/${product.slug}`} target="_blank" rel="noreferrer" className="group mt-1 block text-sm font-medium leading-snug text-paper">
              <span className="underline-offset-4 group-hover:underline">{product.title}</span>
              <ArrowUpRight className="ml-1 inline h-3.5 w-3.5 align-[-2px] text-neutral-500 transition-colors group-hover:text-paper" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          ) : (
            <p className="mt-1 truncate text-sm text-neutral-400" title={review.productSlug || undefined}>
              {productLabel}
            </p>
          )}
        </div>
        <StatusPill tone={review.isApproved ? "solid" : "outline"} className="shrink-0">
          {review.isApproved ? "Approved" : "Pending"}
        </StatusPill>
      </header>

      <div className="flex-1 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <DarkStars value={review.rating} size="md" />
          <p className="text-sm text-neutral-200">
            {review.name || "Anonymous"}
            {review.createdAt && <span className="text-neutral-500"> · {formatDate(review.createdAt)}</span>}
          </p>
        </div>
        {review.title && <h3 className="mt-3 text-base font-medium leading-snug text-paper">{review.title}</h3>}
        {review.body ? (
          <>
            <p className={`mt-2 whitespace-pre-line text-sm leading-6 text-neutral-300 ${long && !expanded ? "line-clamp-4" : ""}`}>{review.body}</p>
            {long && (
              <button type="button" onClick={() => setExpanded((v) => !v)} className={`${textButton} mt-1`} aria-expanded={expanded}>
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm italic text-neutral-500">No written review, only a rating.</p>
        )}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-neutral-800 px-5 py-3">
        <Button variant={review.isApproved ? "inverse-outline" : "inverse"} size="sm" onClick={onApprove} loading={busy === "approve"} disabled={Boolean(busy)}>
          {review.isApproved ? "Unapprove" : "Approve"}
        </Button>
        <button type="button" onClick={onDelete} className={textButton} disabled={Boolean(busy)}>
          Delete
        </button>
      </footer>
    </article>
  );
}
