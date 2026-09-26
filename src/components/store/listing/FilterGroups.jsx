import React, { useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { DEPARTMENTS, SIZE_SETS } from "../../../data/catalog";
import { formatINR } from "../../../lib/format";
import Swatch from "../../ui/Swatch";

export const PRICE_RANGES = [
  { label: "Under ₹1,000", min: null, max: 1000 },
  { label: "₹1,000 to ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 to ₹5,000", min: 2500, max: 5000 },
  { label: "Over ₹5,000", min: 5000, max: null },
];
export const DISCOUNT_STEPS = [10, 20, 30, 50];
const CATEGORY_LIMIT = 8;

export const priceLabel = (min, max) => {
  if (min != null && max != null) return `${formatINR(min)} to ${formatINR(max)}`;
  if (max != null) return `Up to ${formatINR(max)}`;
  if (min != null) return `From ${formatINR(min)}`;
  return "";
};

// ── Collapsible group ──────────────────────────────────────────────────────
export function FilterGroup({ title, active = 0, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  const panelId = useId();
  return (
    <div className="border-b border-line">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-h-[3.25rem] w-full items-center justify-between py-3 text-left" aria-expanded={open} aria-controls={open ? panelId : undefined}>
        <span className="text-[13px] font-medium uppercase tracking-micro">
          {title}
          {active > 0 && <span className="ml-2 tabular-nums text-neutral-500">{active}</span>}
        </span>
        {open ? <Minus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> : <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          // The 4px of padding on the clipping box leaves room for the focus ring of each row.
          <motion.div id={panelId} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }} className="-mx-1 overflow-hidden px-1">
            <div className="pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Row controls ───────────────────────────────────────────────────────────
function CheckRow({ label, checked, count, onChange }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={() => onChange(!checked)} className="group flex min-h-10 w-full items-center gap-3 py-1.5 text-left text-sm text-neutral-800">
      <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center border transition-colors ${checked ? "border-ink bg-ink text-paper" : "border-neutral-500 group-hover:border-ink"}`} aria-hidden="true">
        {checked && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
      </span>
      <span className={`flex-1 ${checked ? "font-medium text-ink" : ""}`}>{label}</span>
      {count != null && <span className="text-xs tabular-nums text-neutral-500">{count}</span>}
    </button>
  );
}

// A native radio (arrow keys move through the group) drawn as a row. Choosing the option that is
// already on clears the group, by click, tap or Space, so a range can be dropped without "Clear all".
// Browsers send no click for Space on a checked radio, hence the key handler.
function RadioRow({ name, label, checked, count, onSelect, onClear }) {
  const onKeyDown = (e) => {
    if (checked && e.key === " ") {
      e.preventDefault();
      onClear();
    }
  };
  return (
    <label className="group flex min-h-10 w-full cursor-pointer items-center gap-3 py-1.5 text-left text-sm text-neutral-800 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink has-[:focus-visible]:ring-offset-2">
      <input type="radio" name={name} checked={checked} onChange={onSelect} onClick={checked ? onClear : undefined} onKeyDown={onKeyDown} className="sr-only" />
      <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${checked ? "border-ink" : "border-neutral-500 group-hover:border-ink"}`} aria-hidden="true">
        {checked && <span className="h-2 w-2 rounded-full bg-ink" />}
      </span>
      <span className={`flex-1 ${checked ? "font-medium text-ink" : ""}`}>{label}</span>
      {count != null && <span className="text-xs tabular-nums text-neutral-500">{count}</span>}
    </label>
  );
}

const toggleIn = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

// ── Category ───────────────────────────────────────────────────────────────
export function CategoryGroup({ facets, selected = [], onChange, grouped = false }) {
  const [showAll, setShowAll] = useState(false);
  const cats = facets.categories || [];
  if (!cats.length) return null;
  const toggle = (key) => onChange({ categories: toggleIn(selected, key) });

  if (grouped) {
    return (
      <FilterGroup title="Category" active={selected.length}>
        <div className="space-y-4">
          {DEPARTMENTS.map((d) => {
            const list = cats.filter((c) => c.department === d.key);
            if (!list.length) return null;
            return (
              <div key={d.key}>
                <p className="eyebrow mb-1">{d.name}</p>
                {list.map((c) => (
                  <CheckRow key={c.key} label={c.name} count={c.count} checked={selected.includes(c.key)} onChange={() => toggle(c.key)} />
                ))}
              </div>
            );
          })}
        </div>
      </FilterGroup>
    );
  }

  const list = showAll ? cats : cats.slice(0, CATEGORY_LIMIT);
  return (
    <FilterGroup title="Category" active={selected.length}>
      {list.map((c) => (
        <CheckRow key={c.key} label={c.name} count={c.count} checked={selected.includes(c.key)} onChange={() => toggle(c.key)} />
      ))}
      {cats.length > CATEGORY_LIMIT && (
        <button type="button" onClick={() => setShowAll((s) => !s)} className="mt-1 inline-flex min-h-10 items-center text-2xs font-medium uppercase tracking-micro underline underline-offset-4 hover:opacity-60" aria-expanded={showAll}>
          {showAll ? "Show fewer" : `Show all ${cats.length}`}
        </button>
      )}
    </FilterGroup>
  );
}

// Category mode: sibling categories as links, current one highlighted.
export function SiblingCategories({ department, categories = [], current }) {
  if (!department) return null;
  return (
    <FilterGroup title={department.name}>
      <div className="flex flex-wrap gap-2">
        <Link to={`/shop/${department.key}`} className="chip">
          All
        </Link>
        {categories.map((c) => (
          <Link key={c.key} to={`/shop/${c.department}/${c.slug}`} className={`chip ${c.key === current ? "chip-active" : ""}`} aria-current={c.key === current ? "page" : undefined}>
            {c.name}
          </Link>
        ))}
      </div>
      <Link to={`/shop/${department.key}`} className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-2xs font-medium uppercase tracking-micro hover:opacity-60">
        Shop all {department.name.toLowerCase()} <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </FilterGroup>
  );
}

// ── Size ───────────────────────────────────────────────────────────────────
function SizeChips({ sizes, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((s) => {
        const on = selected.includes(s.value);
        return (
          <button key={s.value} type="button" onClick={() => onChange({ sizes: toggleIn(selected, s.value) })} className={`chip ${on ? "chip-active" : ""}`} aria-pressed={on} title={`${s.count} ${s.count === 1 ? "item" : "items"}`}>
            {s.value}
          </button>
        );
      })}
    </div>
  );
}

// Sizes come back in a single ordered list; when more than one size set is
// present (a collection mixing apparel and kids, say) label each set.
export function SizeGroup({ facets, selected = [], onChange }) {
  const sizes = useMemo(() => facets.sizes || [], [facets.sizes]);
  const sets = useMemo(() => {
    const seen = new Set();
    const groups = Object.entries(SIZE_SETS)
      .map(([key, set]) => ({ key, label: set.label, sizes: sizes.filter((s) => set.sizes.includes(s.value) && !seen.has(s.value)) }))
      .map((g) => {
        g.sizes.forEach((s) => seen.add(s.value));
        return g;
      })
      .filter((g) => g.sizes.length);
    const rest = sizes.filter((s) => !seen.has(s.value));
    if (rest.length) groups.push({ key: "other", label: "Other", sizes: rest });
    return groups;
  }, [sizes]);
  if (!sizes.length) return null;
  return (
    <FilterGroup title="Size" active={selected.length}>
      {sets.length > 1 ? (
        <div className="space-y-4">
          {sets.map((g) => (
            <div key={g.key}>
              <p className="eyebrow mb-2">{g.label}</p>
              <SizeChips sizes={g.sizes} selected={selected} onChange={onChange} />
            </div>
          ))}
        </div>
      ) : (
        <SizeChips sizes={sizes} selected={selected} onChange={onChange} />
      )}
    </FilterGroup>
  );
}

// ── Colour ─────────────────────────────────────────────────────────────────
export function ColourGroup({ facets, selected = [], onChange }) {
  const colors = facets.colors || [];
  const selectedSet = useMemo(() => new Set(selected.map((c) => String(c).toLowerCase())), [selected]);
  if (!colors.length) return null;
  const toggle = (name) => {
    const key = String(name).toLowerCase();
    const next = selectedSet.has(key) ? selected.filter((c) => String(c).toLowerCase() !== key) : [...selected, name];
    onChange({ colors: next });
  };
  return (
    <FilterGroup title="Colour" active={selected.length}>
      {colors.map((c) => {
        const on = selectedSet.has(String(c.name).toLowerCase());
        return (
          <button key={c.name} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(c.name)} className="group flex min-h-10 w-full items-center gap-3 py-1.5 text-left text-sm text-neutral-800">
            <Swatch hex={c.hex} name={c.name} size="sm" selected={on} as="span" />
            <span className={`flex-1 ${on ? "font-medium text-ink" : ""}`}>{c.name}</span>
            <span className="text-xs tabular-nums text-neutral-500">{c.count}</span>
          </button>
        );
      })}
    </FilterGroup>
  );
}

// ── Price ──────────────────────────────────────────────────────────────────
const toNumber = (v) => {
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

export function PriceGroup({ filters, range, onChange }) {
  const name = useId();
  const [minText, setMinText] = useState(filters.min != null ? String(filters.min) : "");
  const [maxText, setMaxText] = useState(filters.max != null ? String(filters.max) : "");
  useEffect(() => {
    setMinText(filters.min != null ? String(filters.min) : "");
    setMaxText(filters.max != null ? String(filters.max) : "");
  }, [filters.min, filters.max]);

  const active = filters.min != null || filters.max != null ? 1 : 0;
  // Runs on blur and on submit. Only a real change reaches the URL; otherwise the fields are
  // tidied back to the applied range (stray letters dropped, a reversed pair shown in order).
  const commit = (e) => {
    e?.preventDefault();
    let min = toNumber(minText);
    let max = toNumber(maxText);
    if (min != null && max != null && min > max) [min, max] = [max, min];
    if (min === filters.min && max === filters.max) {
      setMinText(min != null ? String(min) : "");
      setMaxText(max != null ? String(max) : "");
      return;
    }
    onChange({ min, max });
  };
  const isRange = (r) => filters.min === r.min && filters.max === r.max;

  return (
    <FilterGroup title="Price" active={active}>
      <form onSubmit={commit} className="flex items-stretch gap-2" aria-label="Price range">
        <label className="relative flex-1">
          <span className="sr-only">Minimum price</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500" aria-hidden="true">
            ₹
          </span>
          <input type="text" inputMode="numeric" autoComplete="off" value={minText} onChange={(e) => setMinText(e.target.value)} onBlur={commit} placeholder={String(range?.min ?? 0)} className="field h-10 w-full py-0 pl-7 pr-2 text-sm tabular-nums" />
        </label>
        <span className="self-center text-neutral-300" aria-hidden="true">
          –
        </span>
        <label className="relative flex-1">
          <span className="sr-only">Maximum price</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500" aria-hidden="true">
            ₹
          </span>
          <input type="text" inputMode="numeric" autoComplete="off" value={maxText} onChange={(e) => setMaxText(e.target.value)} onBlur={commit} placeholder={String(range?.max ?? 0)} className="field h-10 w-full py-0 pl-7 pr-2 text-sm tabular-nums" />
        </label>
        <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center border border-neutral-300 transition-colors hover:border-ink" aria-label="Apply price range">
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </form>
      <fieldset className="mt-3">
        <legend className="sr-only">Quick price ranges</legend>
        {PRICE_RANGES.map((r) => (
          <RadioRow key={r.label} name={name} label={r.label} checked={isRange(r)} onSelect={() => onChange({ min: r.min, max: r.max })} onClear={() => onChange({ min: null, max: null })} />
        ))}
      </fieldset>
    </FilterGroup>
  );
}

// ── Discount ───────────────────────────────────────────────────────────────
export function DiscountGroup({ facets, selected = 0, onChange }) {
  const name = useId();
  if (!facets.discounted) return null;
  return (
    <FilterGroup title="Discount" active={selected ? 1 : 0}>
      <fieldset>
        <legend className="sr-only">Minimum discount</legend>
        {DISCOUNT_STEPS.map((d) => (
          <RadioRow key={d} name={name} label={`${d}% and above`} checked={selected === d} onSelect={() => onChange({ discount: d })} onClear={() => onChange({ discount: 0 })} />
        ))}
      </fieldset>
    </FilterGroup>
  );
}

// ── Availability ───────────────────────────────────────────────────────────
export function AvailabilityGroup({ facets, selected = false, onChange }) {
  return (
    <FilterGroup title="Availability" active={selected ? 1 : 0}>
      <CheckRow label="In stock only" count={facets.inStock} checked={selected} onChange={(v) => onChange({ inStock: v })} />
    </FilterGroup>
  );
}

// ── Panel: every group in order, reused by the sidebar and the drawer ─────
export function FilterPanel({ mode, filters, facets, onChange, department, category, siblingCategories = [] }) {
  const showCategoryGroup = ["all", "department", "new", "sale", "search"].includes(mode);
  return (
    <>
      {mode === "category" && <SiblingCategories department={department} categories={siblingCategories} current={category?.key} />}
      {showCategoryGroup && <CategoryGroup facets={facets} selected={filters.categories} onChange={onChange} grouped={mode !== "department"} />}
      <SizeGroup facets={facets} selected={filters.sizes} onChange={onChange} />
      <ColourGroup facets={facets} selected={filters.colors} onChange={onChange} />
      <PriceGroup filters={filters} range={facets.priceRange} onChange={onChange} />
      <DiscountGroup facets={facets} selected={filters.discount} onChange={onChange} />
      <AvailabilityGroup facets={facets} selected={filters.inStock} onChange={onChange} />
    </>
  );
}
