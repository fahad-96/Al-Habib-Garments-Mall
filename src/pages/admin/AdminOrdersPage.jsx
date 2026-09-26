import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ClipboardList, Download, RefreshCw, Search, X } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useShop } from "../../context/ShopContext";
import { fetchOrders } from "../../lib/adminApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useDebounce } from "../../hooks/useDebounce";
import { pluralize } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/admin/PageHeader";
import StatusTabs, { TABS, isTabKey } from "../../components/admin/orders/StatusTabs";
import OrdersTable from "../../components/admin/orders/OrdersTable";
import { countByStatus, csvFilename, downloadCsv, filterOrders, ordersToCsv } from "../../components/admin/orders/orderUtils";

const NONE = [];

const summaryFor = (counts) => {
  if (!counts.all) return "Orders placed on the website land here the moment they arrive.";
  const waiting = counts.new > 0 ? `${pluralize(counts.new, "order is", "orders are")} waiting for confirmation on WhatsApp.` : "Nothing is waiting for confirmation.";
  return `${pluralize(counts.all, "order")} in total. ${waiting}`;
};

export default function AdminOrdersPage() {
  const { supabase } = useAdmin();
  const { toast } = useShop();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = isTabKey(params.get("status")) ? params.get("status") : "all";
  const [search, setSearch] = useState(params.get("q") || "");
  const term = useDebounce(search, 150);

  const loader = useCallback(() => (supabase ? fetchOrders(supabase, { limit: 500 }) : Promise.resolve(NONE)), [supabase]);
  const { data, loading, error, reload } = useAsyncData(loader);
  const orders = data || NONE;

  const counts = useMemo(() => countByStatus(orders), [orders]);
  const rows = useMemo(() => filterOrders(orders, { status, search: term }), [orders, status, term]);

  const updateParams = (patch, options) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        return next;
      },
      options
    );
  const setStatus = (key) => updateParams({ status: key === "all" ? "" : key });
  const setQuery = (value) => {
    setSearch(value);
    updateParams({ q: value.trim() }, { replace: true });
  };

  const exportCsv = () => {
    if (!rows.length) return;
    downloadCsv(csvFilename(status), ordersToCsv(rows));
    toast(`Exported ${pluralize(rows.length, "order")}`, { type: "success" });
  };

  const tabLabel = TABS.find((t) => t.key === status)?.label || "";
  const emptyText = term.trim() ? `No orders match “${term.trim()}”.` : status === "all" ? "No orders yet." : `No ${tabLabel.toLowerCase()} orders right now.`;
  const firstLoad = loading && !data;
  const nothingYet = !firstLoad && !error && orders.length === 0;
  const failedCold = Boolean(error) && orders.length === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <Seo title="Orders" noindex />
      <PageHeader
        title="Orders"
        description={firstLoad ? "Loading orders." : summaryFor(counts)}
        actions={
          <>
            <Button variant="inverse-outline" size="sm" onClick={reload} loading={loading && Boolean(data)} disabled={loading}>
              {!(loading && data) && <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />}
              Refresh
            </Button>
            <Button variant="inverse-outline" size="sm" onClick={exportCsv} disabled={!rows.length}>
              <Download className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Export CSV
            </Button>
          </>
        }
      />

      {error && (
        <div className="admin-card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <div>
            <p className="text-sm text-paper">Orders could not load.</p>
            <p className="mt-1 text-xs text-neutral-400">{error}</p>
          </div>
          <Button variant="inverse-outline" size="sm" onClick={reload} loading={loading}>
            Try again
          </Button>
        </div>
      )}

      {nothingYet ? (
        <div className="admin-card">
          <EmptyState dark icon={ClipboardList} title="No orders yet" description="Orders placed on the website appear here the moment they arrive, with the customer's WhatsApp number ready to message." />
        </div>
      ) : failedCold ? null : (
        <>
          <div className="mb-5 flex flex-col gap-3 border-b border-neutral-800 lg:flex-row-reverse lg:items-end lg:justify-between lg:gap-6">
            <div className="relative lg:mb-1 lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
              <input
                type="text"
                inputMode="search"
                value={search}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Order number, name or phone"
                aria-label="Search orders"
                className="field field-dark field-sm h-10 pl-10 pr-10"
              />
              {search && (
                <button type="button" onClick={() => setQuery("")} className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-neutral-500 hover:text-paper" aria-label="Clear search">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <StatusTabs value={status} counts={data ? counts : {}} onChange={setStatus} className="min-w-0 lg:flex-1" />
          </div>

          <OrdersTable rows={rows} loading={firstLoad} empty={emptyText} onOpen={(o) => navigate(`/admin/orders/${o.id}`)} />

          {!firstLoad && rows.length > 0 && (
            <p className="mt-3 text-xs text-neutral-500">
              Showing {rows.length === orders.length ? pluralize(rows.length, "order") : `${rows.length} of ${pluralize(orders.length, "order")}`}
              {orders.length >= 500 ? " (the most recent 500)" : ""}.
            </p>
          )}
        </>
      )}
    </div>
  );
}
