import { useCallback, useEffect, useState } from "react";

// Small loader hook for admin pages: { data, loading, error, reload, setData }.
// Pass a stable `loader` (wrap it in useCallback with its own dependencies).
export function useAsyncData(loader, { initial = null } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    loader()
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((e) => {
        if (alive) setError(e?.message || "Something went wrong.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [loader, tick]);

  return { data, setData, loading, error, reload };
}
