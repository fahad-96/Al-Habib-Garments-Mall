import { useCallback, useMemo } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { deleteRow, fetchTable, saveRow } from "../../../lib/adminApi";

const NONE = [];
const NOT_CONNECTED = "The store is not connected to its database.";

// Rows of one admin table (coupons, size_guides) with optimistic local updates after save and delete.
// `sortBy` keeps the list in the same order the server would return it.
export function useConfigTable(table, { sortBy } = {}) {
  const { supabase } = useAdmin();
  const loader = useCallback(() => (supabase ? fetchTable(supabase, table) : Promise.resolve(NONE)), [supabase, table]);
  const { data, setData, loading, error, reload } = useAsyncData(loader);

  const rows = useMemo(() => {
    const list = data || NONE;
    return sortBy ? [...list].sort(sortBy) : list;
  }, [data, sortBy]);

  const save = useCallback(
    async (item) => {
      if (!supabase) throw new Error(NOT_CONNECTED);
      const saved = await saveRow(supabase, table, item);
      setData((prev) => {
        const list = prev || [];
        const i = list.findIndex((r) => r.id === saved.id);
        if (i === -1) return [saved, ...list];
        const next = [...list];
        next[i] = saved;
        return next;
      });
      return saved;
    },
    [supabase, table, setData]
  );

  const remove = useCallback(
    async (id) => {
      if (!supabase) throw new Error(NOT_CONNECTED);
      await deleteRow(supabase, table, id);
      setData((prev) => (prev || []).filter((r) => r.id !== id));
      return true;
    },
    [supabase, table, setData]
  );

  return { rows, loading, error, reload, save, remove, connected: Boolean(supabase), firstLoad: loading && !data };
}
