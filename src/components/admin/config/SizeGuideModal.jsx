import React, { useId, useMemo, useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { Checkbox, Input, Textarea } from "../../ui/Fields";
import { SIZE_SETS } from "../../../data/catalog";
import { slugify } from "../../../lib/format";
import ColumnsEditor from "./ColumnsEditor";
import RowsGridEditor from "./RowsGridEditor";
import { blankGuide, DEPARTMENT_OPTIONS, formToGuide, guideToForm, missingSizes, SIZE_SET_OPTIONS, validateGuide } from "./sizeGuideUtils";

function Group({ title, hint, error, children }) {
  return (
    <fieldset className="min-w-0">
      <legend className="label label-dark">{title}</legend>
      <div className="-my-1">{children}</div>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-neutral-500">{hint}</p> : null}
    </fieldset>
  );
}

function Section({ title, description, children, id }) {
  return (
    <section aria-labelledby={id} className="border-t border-neutral-800 pt-5 first:border-t-0 first:pt-0">
      <h3 id={id} className="text-sm font-medium text-paper">
        {title}
      </h3>
      {description && <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const toggleIn = (list, key, on) => (on ? (list.includes(key) ? list : [...list, key]) : list.filter((k) => k !== key));

// Create or edit one size guide. `existing` is used to refuse duplicate slugs before the database does.
export default function SizeGuideModal({ open, guide, existing = [], onClose, onSave }) {
  const formId = useId();
  const [initial] = useState(() => guide || blankGuide());
  const isNew = !initial.id;
  const [form, setForm] = useState(() => guideToForm(initial));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const patch = (changes) => {
    setForm((f) => ({ ...f, ...changes }));
    const touched = Object.keys(changes);
    if (touched.some((k) => errors[k])) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !touched.includes(k))));
    if (serverError) setServerError("");
  };

  const setTitle = (title) => patch(isNew && !slugTouched ? { title, slug: slugify(title) } : { title });
  const setSlug = (slug) => {
    setSlugTouched(true);
    patch({ slug });
  };

  // Columns and rows share a width: removing or adding a column edits every row too.
  const setColumns = (columns, change) => {
    if (change?.removeIndex != null) patch({ columns, rows: form.rows.map((r) => r.filter((_, i) => i !== change.removeIndex)) });
    else if (change?.addIndex != null) patch({ columns, rows: form.rows.map((r) => [...r, ""]) });
    else patch({ columns });
  };

  const fillSizes = useMemo(() => missingSizes(form), [form]);
  const fillLabel = form.sizeSets.length === 1 ? SIZE_SETS[form.sizeSets[0]]?.label || "the size set" : "the chosen size sets";

  const submit = async (e) => {
    e.preventDefault();
    const next = validateGuide(form, existing);
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      e.currentTarget.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSave(formToGuide(form));
    } catch (err) {
      setServerError(err?.message || "The guide could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={isNew ? "New size guide" : "Edit size guide"}
      dark
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="hidden truncate text-xs text-neutral-500 sm:block">
            {form.rows.length} {form.rows.length === 1 ? "row" : "rows"} · {form.columns.length} {form.columns.length === 1 ? "column" : "columns"}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="inverse-outline" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="inverse" size="sm" type="submit" form={formId} loading={saving}>
              {isNew ? "Create guide" : "Save changes"}
            </Button>
          </div>
        </div>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-6">
        <Section id={`${formId}-basics`} title="Basics">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input dark name="title" label="Title" value={form.title} onChange={(e) => setTitle(e.target.value)} placeholder="Men's apparel" autoComplete="off" error={errors.title} />
            <Input dark name="slug" label="Slug" value={form.slug} onChange={(e) => setSlug(e.target.value)} onBlur={() => patch({ slug: slugify(form.slug) })} placeholder="men-apparel" autoComplete="off" spellCheck={false} error={errors.slug} hint={`/size-guide?guide=${slugify(form.slug) || "…"}`} />
          </div>
        </Section>

        <Section id={`${formId}-applies`} title="Applies to" description="A product uses the guide that matches its size set and department. If none matches the department, any guide with the same size set is used.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Group title="Departments" hint="Leave all unticked to apply to every department.">
              {DEPARTMENT_OPTIONS.map((d) => (
                <Checkbox key={d.key} dark label={d.label} checked={form.departments.includes(d.key)} onChange={(on) => patch({ departments: toggleIn(form.departments, d.key, on) })} />
              ))}
            </Group>
            <Group title="Size sets" error={errors.sizeSets}>
              {SIZE_SET_OPTIONS.map((s) => (
                <Checkbox key={s.key} dark label={s.label} checked={form.sizeSets.includes(s.key)} onChange={(on) => patch({ sizeSets: toggleIn(form.sizeSets, s.key, on) })} />
              ))}
            </Group>
          </div>
        </Section>

        <Section id={`${formId}-columns`} title="Columns">
          <ColumnsEditor columns={form.columns} onChange={setColumns} error={errors.columns} />
        </Section>

        <Section id={`${formId}-rows`} title="Rows" description="One row per size, in the order customers should read them.">
          <RowsGridEditor columns={form.columns} rows={form.rows} onChange={(rows) => patch({ rows })} error={errors.rows} fillSizes={fillSizes} fillLabel={fillLabel} />
        </Section>

        <Section id={`${formId}-note`} title="Note">
          <Textarea dark name="note" label="Shown under the chart" rows={3} value={form.note} onChange={(e) => patch({ note: e.target.value })} placeholder="Measure a shirt that fits you well and compare." hint="Optional. Fit advice, hemming, what to do between sizes." />
        </Section>

        {serverError && (
          <p role="alert" className="border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {serverError}
          </p>
        )}
      </form>
    </Modal>
  );
}
