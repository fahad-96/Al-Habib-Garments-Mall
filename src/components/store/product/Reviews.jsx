import React, { useCallback, useMemo } from "react";
import { Star } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import { supabase } from "../../../lib/supabaseClient";
import { fetchProductReviews } from "../../../lib/storeApi";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { formatDate } from "../../../lib/format";
import Stars from "../../ui/Stars";
import { Skeleton } from "../../ui/Skeleton";
import ReviewForm from "./ReviewForm";

const STARS = [5, 4, 3, 2, 1];

function RatingBars({ counts, total }) {
  return (
    <ol className="mt-7 space-y-2.5" aria-label="Rating distribution">
      {STARS.map((star) => {
        const n = counts[star] || 0;
        const pct = total ? Math.round((n / total) * 100) : 0;
        return (
          <li key={star} className="flex items-center gap-3 text-xs tabular-nums">
            <span className="flex w-7 items-center gap-1 text-ink">
              <span>{star}</span>
              <Star className="h-3 w-3 fill-ink text-ink" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="h-1.5 flex-1 bg-neutral-200" role="img" aria-label={`${n} ${n === 1 ? "review" : "reviews"} with ${star} stars`}>
              <span className="block h-full bg-ink transition-[width] duration-500 ease-soft" style={{ width: `${pct}%` }} />
            </span>
            <span className="w-6 text-right text-neutral-500">{n}</span>
          </li>
        );
      })}
    </ol>
  );
}

function ReviewItem({ review }) {
  return (
    <li className="py-6 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <Stars value={review.rating} size="sm" />
        <span className="text-xs text-neutral-500">{formatDate(review.createdAt)}</span>
      </div>
      {review.title && <h3 className="mt-2.5 text-sm font-medium text-ink">{review.title}</h3>}
      {review.body && <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{review.body}</p>}
      <p className="mt-3 text-2xs font-medium uppercase tracking-micro text-neutral-500">{review.name || "Customer"}</p>
    </li>
  );
}

export default function Reviews({ product, rating }) {
  const { isSupabaseConfigured } = useShop();
  const live = isSupabaseConfigured && Boolean(supabase);
  const productId = product.id;
  const loader = useCallback(() => (live ? fetchProductReviews(supabase, productId) : Promise.resolve([])), [live, productId]);
  const { data, loading, error, reload } = useAsyncData(loader, { initial: [] });
  const reviews = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const counts = useMemo(
    () =>
      reviews.reduce((acc, r) => {
        const k = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0)));
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {}),
    [reviews]
  );
  const listAverage = reviews.length ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length : 0;
  const count = rating?.count || reviews.length;
  const average = rating?.count ? rating.average : listAverage;

  return (
    <div id="reviews" className="scroll-mt-24">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="eyebrow">Reviews</p>
          <h2 id="reviews-heading" className="mt-2 font-display text-3xl leading-[1.05] tracking-tight sm:text-4xl">{count > 0 ? "What customers say" : "No reviews yet"}</h2>
          <div className="mt-6 flex items-end gap-4">
            <span className="font-display text-6xl leading-none tabular-nums text-ink">{count > 0 ? average.toFixed(1) : "0.0"}</span>
            <div className="pb-1">
              <Stars value={average} size="md" />
              <p className="mt-1.5 text-xs text-neutral-500">{count > 0 ? `Based on ${count} ${count === 1 ? "review" : "reviews"}` : "Nothing written up yet."}</p>
            </div>
          </div>
          <RatingBars counts={counts} total={reviews.length} />
        </div>
        <div className="lg:col-span-8">
          {live && loading ? (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ) : error ? (
            <p className="text-sm text-neutral-500">
              Could not load reviews right now.{" "}
              <button type="button" onClick={reload} className="underline underline-offset-4 hover:text-ink">
                Try again
              </button>
            </p>
          ) : reviews.length > 0 ? (
            <ul className="divide-y divide-line">
              {reviews.map((r) => (
                <ReviewItem key={r.id} review={r} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">{live ? "No reviews for this piece yet. Yours could be the first." : "Reviews open once the store is live."}</p>
          )}
          {live && <ReviewForm product={product} className="mt-10" />}
        </div>
      </div>
    </div>
  );
}
