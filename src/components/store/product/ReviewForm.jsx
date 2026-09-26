import React, { useState } from "react";
import { useShop } from "../../../context/ShopContext";
import { supabase } from "../../../lib/supabaseClient";
import { customerMessage, submitReview } from "../../../lib/storeApi";
import Stars from "../../ui/Stars";
import Button from "../../ui/Button";
import { Input, Textarea } from "../../ui/Fields";

const EMPTY = { rating: 0, name: "", title: "", body: "" };
const BODY_MAX = 1200;

export default function ReviewForm({ product, className = "" }) {
  const { toast } = useShop();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const patch = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => (er[key] ? { ...er, [key]: "" } : er));
  };

  const validate = () => {
    const next = {};
    if (!form.rating) next.rating = "Choose a rating.";
    if (!form.name.trim()) next.name = "Add your name.";
    if (form.body.trim().length < 10) next.body = "Tell us a little more, at least 10 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await submitReview(supabase, { productId: product.id, productSlug: product.slug, ...form });
      toast("Thanks. Your review will appear once approved.", { type: "success", duration: 4200 });
      setForm(EMPTY);
      setErrors({});
    } catch (err) {
      toast(customerMessage(err, "We could not send your review. Please try again."), { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className={`border border-line p-5 sm:p-7 ${className}`}>
      <h3 className="font-display text-2xl leading-tight">Write a review</h3>
      <p className="mt-1 text-xs text-neutral-500">We read every review before it appears on the page.</p>
      <div className="mt-6">
        <p className="label" id="review-rating-label">
          Your rating
        </p>
        <Stars
          interactive
          size="lg"
          labelledBy="review-rating-label"
          describedBy={errors.rating ? "review-rating-error" : undefined}
          value={form.rating}
          onChange={(v) => {
            setForm((f) => ({ ...f, rating: v }));
            setErrors((er) => (er.rating ? { ...er, rating: "" } : er));
          }}
        />
        {errors.rating && (
          <p id="review-rating-error" className="mt-1.5 text-xs font-medium text-ink" role="alert">
            {errors.rating}
          </p>
        )}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input label="Name" value={form.name} onChange={patch("name")} error={errors.name} maxLength={60} autoComplete="name" />
        <Input label="Title (optional)" value={form.title} onChange={patch("title")} maxLength={120} placeholder="Sum it up in a few words" />
      </div>
      <Textarea className="mt-4" label="Review" rows={4} value={form.body} onChange={patch("body")} error={errors.body} maxLength={BODY_MAX} placeholder="How does it fit, feel and wash?" />
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs tabular-nums text-neutral-500">
          {form.body.length}/{BODY_MAX}
        </p>
        <Button type="submit" loading={busy}>
          Submit review
        </Button>
      </div>
    </form>
  );
}
