// Pure helpers for the size-guide admin: form ↔ guide shape, validation and summaries.
import { DEPARTMENTS, SIZE_SETS, departmentName } from "../../../data/catalog";
import { slugify } from "../../../lib/format";

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((d) => ({ key: d.key, label: d.name }));
export const SIZE_SET_OPTIONS = Object.entries(SIZE_SETS).map(([key, set]) => ({ key, label: set.label }));

export const padRow = (row, n) => Array.from({ length: n }, (_, i) => String(row?.[i] ?? ""));

export const blankGuide = () => ({
  id: null,
  slug: "",
  title: "",
  appliesTo: { departments: [], sizeSets: [] },
  columns: ["Size", "Chest (in)", "Length (in)"],
  rows: [],
  note: "",
});

export const guideToForm = (g) => {
  const columns = g.columns?.length ? g.columns.map(String) : ["Size"];
  return {
    id: g.id || null,
    slug: g.slug || "",
    title: g.title || "",
    departments: [...(g.appliesTo?.departments || [])],
    sizeSets: [...(g.appliesTo?.sizeSets || [])],
    columns,
    rows: (g.rows || []).map((r) => padRow(r, columns.length)),
    note: g.note || "",
  };
};

export const formToGuide = (f) => ({
  ...(f.id ? { id: f.id } : {}),
  slug: slugify(f.slug),
  title: f.title.trim(),
  appliesTo: { departments: [...f.departments], sizeSets: [...f.sizeSets] },
  columns: f.columns.map((c) => c.trim()),
  rows: f.rows.map((r) => r.map((cell) => String(cell).trim())),
  note: f.note.trim(),
});

export const validateGuide = (f, existing = []) => {
  const errors = {};
  if (!f.title.trim()) errors.title = "Give the guide a title.";
  const slug = slugify(f.slug);
  if (!slug) errors.slug = "Enter a slug.";
  else if (existing.some((g) => g.slug === slug && g.id !== f.id)) errors.slug = "Another guide already uses this slug.";
  if (!f.sizeSets.length) errors.sizeSets = "Pick at least one size set so products can find this guide.";
  if (!f.columns.length) errors.columns = "Add at least one column.";
  else if (f.columns.some((c) => !c.trim())) errors.columns = "Name every column, or remove the empty one.";
  if (!f.rows.length) errors.rows = "Add at least one row.";
  else if (f.rows.some((r) => !String(r[0] || "").trim())) errors.rows = "Every row needs a value in the first column.";
  return errors;
};

export const appliesSummary = (g) => ({
  departments: (g.appliesTo?.departments || []).map((k) => departmentName(k) || k).filter(Boolean),
  sizeSets: (g.appliesTo?.sizeSets || []).map((k) => SIZE_SETS[k]?.label || k),
});

// Sizes of the chosen sets that are not yet in the first column, in catalog order.
export const missingSizes = (f) => {
  const have = new Set(f.rows.map((r) => String(r[0] || "").trim()));
  const out = [];
  f.sizeSets.forEach((key) => (SIZE_SETS[key]?.sizes || []).forEach((s) => !have.has(s) && !out.includes(s) && out.push(s)));
  return out;
};

export const compareGuides = (a, b) => String(a.slug || "").localeCompare(String(b.slug || ""));
