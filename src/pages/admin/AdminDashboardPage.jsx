import React, { useCallback, useMemo } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useShop } from "../../context/ShopContext";
import { fetchDashboard } from "../../lib/adminApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import { formatINR, pluralize, timeAgo } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/admin/PageHeader";
import StatTile, { StatGrid } from "../../components/admin/dashboard/StatTile";
import RecentOrders from "../../components/admin/dashboard/RecentOrders";
import LowStockList from "../../components/admin/dashboard/LowStockList";
import CatalogSetupCard from "../../components/admin/dashboard/CatalogSetupCard";
import QuickLinks from "../../components/admin/dashboard/QuickLinks";
import DashboardSkeleton from "../../components/admin/dashboard/DashboardSkeleton";
import { computeDashboardStats, greetingFor, longDate } from "../../components/admin/dashboard/dashboardStats";

const EMPTY = { products: [], orders: [], pendingReviews: 0 };
const money = (n) => (n >= 1000000 ? formatINR(n, { compact: true }) : formatINR(n));

// fetchDashboard() reads the pending-review count from `data`, which a head request
// leaves null, so the number is counted here until adminApi returns `count`.
const countPendingReviews = async (supabase) => {
  const { count, error } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false);
  return error ? null : Number(count) || 0;
};

export default function AdminDashboardPage() {
  const { supabase } = useAdmin();
  const { settings } = useShop();

  const loader = useCallback(async () => {
    if (!supabase) return EMPTY;
    const [dashboard, pending] = await Promise.all([fetchDashboard(supabase), countPendingReviews(supabase)]);
    return pending == null ? dashboard : { ...dashboard, pendingReviews: pending };
  }, [supabase]);
  const { data, loading, error, reload } = useAsyncData(loader);

  const stats = useMemo(() => computeDashboardStats(data || EMPTY), [data]);
  const now = new Date();
  const storeName = settings?.storeName || "Al Habib Garments Mall";
  const liveCount = data?.products?.length || 0;
  const showSetupFirst = Boolean(data) && liveCount === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <Seo title="Dashboard" noindex />
      <PageHeader
        eyebrow={storeName}
        title={greetingFor(now)}
        description={`${longDate(now)}. ${stats.awaiting > 0 ? `${pluralize(stats.awaiting, "order is", "orders are")} waiting for confirmation on WhatsApp.` : "Nothing is waiting for confirmation."}`}
        actions={
          <>
            <Button variant="inverse-outline" size="sm" onClick={reload} loading={loading && Boolean(data)} disabled={loading}>
              {!(loading && data) && <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />}
              Refresh
            </Button>
            <Button variant="inverse" size="sm" href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              View store
            </Button>
          </>
        }
      />

      {error && (
        <div className="admin-card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <div>
            <p className="text-sm text-paper">The dashboard could not load.</p>
            <p className="mt-1 text-xs text-neutral-400">{error}</p>
          </div>
          <Button variant="inverse-outline" size="sm" onClick={reload} loading={loading}>
            Try again
          </Button>
        </div>
      )}

      {!data && loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {showSetupFirst && <CatalogSetupCard liveCount={liveCount} onImported={reload} />}

          <StatGrid>
            <StatTile label="Orders today" value={stats.ordersToday} hint={`${stats.ordersYesterday} yesterday`} to="/admin/orders" />
            <StatTile label="Orders this month" value={stats.ordersMonth} hint={`${stats.deliveredMonth} delivered`} to="/admin/orders" />
            <StatTile label="Revenue this month" value={money(stats.revenueMonth)} hint={pluralize(stats.paidMonth, "confirmed order")} to="/admin/orders" />
            <StatTile label="Awaiting confirmation" value={stats.awaiting} hint={stats.awaiting > 0 ? `Oldest ${timeAgo(stats.oldestAwaitingAt)}` : "All caught up"} to="/admin/orders" />
            <StatTile label="Active products" value={stats.activeProducts} hint={stats.hiddenProducts > 0 ? `${stats.hiddenProducts} hidden` : liveCount > 0 ? "All visible" : "Built-in catalog"} to="/admin/products" />
            <StatTile label="Units in stock" value={stats.units.toLocaleString("en-IN")} hint={`across ${pluralize(stats.variantCount, "size")}`} to="/admin/products" />
            <StatTile label="Low stock" value={stats.lowStockCount} hint={`${stats.soldOutCount} sold out`} to="/admin/products" />
            <StatTile label="Pending reviews" value={stats.pendingReviews} hint={stats.pendingReviews > 0 ? "Awaiting approval" : "Nothing waiting"} to="/admin/reviews" />
          </StatGrid>

          <QuickLinks />

          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <RecentOrders orders={stats.recentOrders} />
            <LowStockList items={stats.lowStock} total={stats.lowStockCount} soldOut={stats.soldOutCount} />
          </div>

          {!showSetupFirst && <CatalogSetupCard liveCount={liveCount} onImported={reload} />}
        </div>
      )}
    </div>
  );
}
