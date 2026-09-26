import React, { useId } from "react";
import { Search, X } from "lucide-react";
import { Select } from "../../ui/Fields";
import { DEPARTMENTS } from "../../../data/catalog";

export const EMPTY_PRODUCT_FILTERS = { search: "", status: "all", department: "", categoryKey: "" };

export const hasActiveFilters = (f) => Boolean(f.search.trim() || f.status !== "all" || f.department || f.categoryKey);

export default function ProductsToolbar({ filters, onChange, categories }) {
  const searchId = useId();
  const set = (changes) => onChange({ ...filters, ...changes });
  const inDepartment = filters.department ? categories.filter((c) => c.department === filters.department) : categories;
  const departmentOf = (key) => categories.find((c) => c.key === key)?.department || "";

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative lg:w-80">
        <label htmlFor={searchId} className="sr-only">
          Search products
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
        <input id={searchId} type="search" value={filters.search} onChange={(e) => set({ search: e.target.value })} placeholder="Search title, slug or brand" autoComplete="off" className="field field-dark pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden" />
        {filters.search && (
          <button type="button" onClick={() => set({ search: "" })} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-neutral-400 hover:text-paper" aria-label="Clear search">
            <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <Select dark aria-label="Status" value={filters.status} onChange={(e) => set({ status: e.target.value })} className="sm:w-40">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </Select>
        <Select
          dark
          aria-label="Department"
          value={filters.department}
          onChange={(e) => {
            const department = e.target.value;
            set({ department, categoryKey: department && departmentOf(filters.categoryKey) !== department ? "" : filters.categoryKey });
          }}
          className="sm:w-44"
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.key} value={d.key}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select dark aria-label="Category" value={filters.categoryKey} onChange={(e) => set({ categoryKey: e.target.value })} className="col-span-2 sm:col-span-1 sm:w-52">
          <option value="">All categories</option>
          {inDepartment.map((c) => (
            <option key={c.key} value={c.key}>
              {filters.department ? c.name : `${c.name} · ${c.department}`}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
