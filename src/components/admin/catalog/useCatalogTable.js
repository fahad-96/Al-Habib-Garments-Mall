import { useCallback, useMemo } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { useShop } from "../../../context/ShopContext";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { deleteRow, fetchTable, saveRow } from "../../../lib/adminApi";

// Categories are keyed by `key` (department-slug); banners and collections by id.
const KEY_OF = { categories: (r) => r.key, banners: (r) => r.id, collections: (r) => r.id };

// Postgres refuses to delete a category that products still point at (on delete restrict).
export const isReferenceError = (e) => /violates foreign key|restrict/i.test(String(e?.message || ""));

export const nextSortOrder = (rows) => rows.reduce((max, r) => Math.max(max, Number(r.sortOrder) || 0), 0) + 10;

export const bySortOrder = (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || String(a.name || a.title || "").localeCompare(String(b.name || b.title || ""));

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Loads one admin table, keeps the list in sync after saves and deletes, refreshes the storefront
// catalog and toasts. Errors are thrown to the caller so the editor or dialog can show them.
export function useCatalogTable(table, { noun = "item" } = {}) {
  const { supabase } = useAdmin();
  const { toast, refreshCatalog } = useShop();
  const keyOf = KEY_OF[table];

  const loader = useCallback(() => (supabase ? fetchTable(supabase, table) : Promise.resolve([])), [supabase, table]);
  const { data, setData, loading, error, reload } = useAsyncData(loader);
  const rows = useMemo(() => [...(data || [])].sort(bySortOrder), [data]);

  const save = useCallback(
    async (item) => {
      if (!supabase) throw new Error("Connect Supabase to save changes.");
      const saved = await saveRow(supabase, table, item);
      setData((prev) => {
        const list = prev || [];
        const index = list.findIndex((r) => keyOf(r) === keyOf(saved));
        if (index === -1) return [...list, saved];
        const next = [...list];
        next[index] = saved;
        return next;
      });
      refreshCatalog?.();
      toast(`${capitalize(noun)} saved.`, { type: "success" });
      return saved;
    },
    [supabase, table, keyOf, setData, refreshCatalog, toast, noun]
  );

  const remove = useCallback(
    async (item) => {
      if (!supabase) throw new Error("Connect Supabase to delete.");
      const key = keyOf(item);
      await deleteRow(supabase, table, key);
      setData((prev) => (prev || []).filter((r) => keyOf(r) !== key));
      refreshCatalog?.();
      toast(`${capitalize(noun)} deleted.`, { type: "success" });
    },
    [supabase, table, keyOf, setData, refreshCatalog, toast, noun]
  );

  return { rows, loading: loading && !data, refreshing: loading && Boolean(data), error, reload, save, remove };
}
