import React, { useId, useMemo, useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { Input, Select, Toggle } from "../../ui/Fields";
import { formatINR } from "../../../lib/format";
import NumberField from "./NumberField";
import { CouponStatusPill } from "./couponColumns";
import { blankCoupon, CODE_MAX, cleanCode, couponToForm, formToCoupon, previewCoupon, validateCoupon } from "./couponUtils";

const dateStyle = { colorScheme: "dark" };
const codeStyle = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", letterSpacing: "0.08em", textTransform: "uppercase" };

// Create or edit one coupon. `existing` is used to refuse duplicate codes before the database does.
export default function CouponModal({ open, coupon, existing = [], onClose, onSave }) {
  const formId = useId();
  // Pinned on mount so the title and footer stay put while the modal animates out.
  const [initial] = useState(() => coupon || blankCoupon());
  const isNew = !initial.id;
  const [form, setForm] = useState(() => couponToForm(initial));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const patch = (changes) => {
    setForm((f) => ({ ...f, ...changes }));
    const touched = Object.keys(changes);
    if (touched.some((k) => errors[k])) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !touched.includes(k))));
    if (serverError) setServerError("");
  };

  const preview = useMemo(() => previewCoupon(form), [form]);
  const status = useMemo(() => formToCoupon(form), [form]);

  const submit = async (e) => {
    e.preventDefault();
    const next = validateCoupon(form, existing);
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      e.currentTarget.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSave(formToCoupon(form));
    } catch (err) {
      setServerError(err?.message || "The coupon could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={isNew ? "New coupon" : "Edit coupon"}
      dark
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <CouponStatusPill coupon={status} />
            {!isNew && <span className="truncate text-xs tabular-nums text-neutral-500">Used {form.usedCount} {form.usedCount === 1 ? "time" : "times"}</span>}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="inverse-outline" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="inverse" size="sm" type="submit" form={formId} loading={saving}>
              {isNew ? "Create coupon" : "Save changes"}
            </Button>
          </div>
        </div>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        <Input
          dark
          name="code"
          label="Code"
          value={form.code}
          onChange={(e) => patch({ code: cleanCode(e.target.value) })}
          placeholder="WELCOME10"
          maxLength={CODE_MAX}
          autoComplete="off"
          spellCheck={false}
          style={codeStyle}
          error={errors.code}
          hint="3 to 24 letters or digits. Customers type this in their bag."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select dark name="type" label="Type" value={form.type} onChange={(e) => patch({ type: e.target.value })}>
            <option value="percent">Percentage off</option>
            <option value="flat">Flat amount off</option>
          </Select>
          <NumberField
            name="value"
            label={form.type === "flat" ? "Amount off" : "Percent off"}
            value={form.value}
            onChange={(value) => patch({ value })}
            prefix={form.type === "flat" ? "₹" : undefined}
            suffix={form.type === "percent" ? "%" : undefined}
            placeholder={form.type === "flat" ? "200" : "10"}
            error={errors.value}
          />
          <NumberField name="minOrder" label="Minimum order" value={form.minOrder} onChange={(minOrder) => patch({ minOrder })} prefix="₹" placeholder="0" hint="Leave empty for no minimum." error={errors.minOrder} />
          {form.type === "percent" ? (
            <NumberField name="maxDiscount" label="Maximum discount" value={form.maxDiscount} onChange={(maxDiscount) => patch({ maxDiscount })} prefix="₹" placeholder="No cap" hint="Caps what a percentage can take off a large bag." error={errors.maxDiscount} />
          ) : (
            <NumberField name="usageLimit" label="Usage limit" value={form.usageLimit} onChange={(usageLimit) => patch({ usageLimit })} placeholder="Unlimited" hint="Total redemptions across all customers." error={errors.usageLimit} />
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input dark name="startsAt" type="datetime-local" label="Starts at" value={form.startsAt} onChange={(e) => patch({ startsAt: e.target.value })} style={dateStyle} error={errors.startsAt} hint="Empty means it works right away." />
          <Input dark name="expiresAt" type="datetime-local" label="Expires at" value={form.expiresAt} onChange={(e) => patch({ expiresAt: e.target.value })} style={dateStyle} error={errors.expiresAt} hint="Empty means it never expires." />
          {form.type === "percent" && (
            <NumberField name="usageLimit" label="Usage limit" value={form.usageLimit} onChange={(usageLimit) => patch({ usageLimit })} placeholder="Unlimited" hint="Total redemptions across all customers." error={errors.usageLimit} />
          )}
          <div className="flex items-center border border-neutral-800 px-4 py-3.5 sm:self-end">
            <Toggle dark className="w-full" checked={form.isActive} onChange={(isActive) => patch({ isActive })} label={form.isActive ? "Active" : "Switched off"} description={form.isActive ? "Customers can use it inside its dates." : "Nobody can use it until you switch it back on."} />
          </div>
        </div>

        <div className="border border-neutral-800 bg-neutral-900/60 px-4 py-3" aria-live="polite">
          <p className="eyebrow-dark">Preview</p>
          <p className="mt-1 text-sm text-neutral-300">
            Bag of <span className="tabular-nums text-paper">{formatINR(preview.bag)}</span> <span aria-hidden="true">→</span>{" "}
            <span className={preview.valid ? "text-paper" : "text-neutral-400"}>{preview.text}</span>
          </p>
        </div>

        {serverError && (
          <p role="alert" className="border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {serverError}
          </p>
        )}
      </form>
    </Modal>
  );
}
