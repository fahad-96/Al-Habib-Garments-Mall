import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useShop } from "../../context/ShopContext";
import { fetchOrder } from "../../lib/adminApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import { STORE } from "../../data/catalog";
import { formatDateTime, pluralize, timeAgo } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/admin/PageHeader";
import StatusPill from "../../components/admin/StatusPill";
import OrderItemsCard from "../../components/admin/orders/OrderItemsCard";
import OrderTotalsCard from "../../components/admin/orders/OrderTotalsCard";
import CustomerCard from "../../components/admin/orders/CustomerCard";
import OrderStatusCard from "../../components/admin/orders/OrderStatusCard";
import AdminNoteCard from "../../components/admin/orders/AdminNoteCard";
import DangerZone from "../../components/admin/orders/DangerZone";
import PackingSlip from "../../components/admin/orders/PackingSlip";
import OrderDetailSkeleton from "../../components/admin/orders/OrderDetailSkeleton";
import { itemCount } from "../../components/admin/orders/orderUtils";

// PostgREST's wording for "no such row" is not something an admin should read.
const explain = (error) => (/rows returned|no rows|not found/i.test(error || "") ? "No order exists with this id. It may have been deleted." : error || "It may have been deleted, or the link is wrong.");

const describe = (order) => {
  const parts = [`Placed ${formatDateTime(order.createdAt)}`, pluralize(itemCount(order), "item")];
  if (order.updatedAt && order.updatedAt !== order.createdAt) parts.push(`updated ${timeAgo(order.updatedAt)}`);
  return parts.join(" · ");
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { supabase } = useAdmin();
  const { settings } = useShop();

  const loader = useCallback(() => (supabase && id ? fetchOrder(supabase, id) : Promise.resolve(null)), [supabase, id]);
  const { data: order, setData, loading, error, reload } = useAsyncData(loader);

  const storeName = settings?.storeName || STORE.name;
  const firstLoad = loading && !order;

  return (
    <div className="mx-auto max-w-6xl">
      <Seo title={order?.orderNumber ? `Order ${order.orderNumber}` : "Order"} noindex />
      <PageHeader
        backTo="/admin/orders"
        backLabel="All orders"
        eyebrow="Order"
        title={
          order ? (
            <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="tabular-nums">{order.orderNumber || "Order"}</span>
              <StatusPill status={order.status} />
            </span>
          ) : (
            "Order"
          )
        }
        description={order ? describe(order) : firstLoad ? "Loading order." : ""}
        actions={
          order && (
            <Button variant="inverse-outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Print packing slip
            </Button>
          )
        }
      />

      {firstLoad ? (
        <OrderDetailSkeleton />
      ) : error || !order ? (
        <div className="admin-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <div>
            <p className="text-sm text-paper">This order could not be loaded.</p>
            <p className="mt-1 text-xs text-neutral-400">{explain(error)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="inverse-outline" size="sm" onClick={reload} loading={loading}>
              Try again
            </Button>
            <Button variant="inverse" size="sm" to="/admin/orders">
              All orders
            </Button>
          </div>
        </div>
      ) : (
        // Column wrappers dissolve on phones (display: contents) so the cards can
        // be ordered for a small screen: customer, items, totals, status, note.
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
          <div className="contents lg:block lg:space-y-6">
            <div className="order-2 lg:order-none">
              <OrderItemsCard order={order} />
            </div>
            <div className="order-3 lg:order-none">
              <OrderTotalsCard order={order} />
            </div>
            <div className="order-5 lg:order-none">
              <AdminNoteCard order={order} onSaved={setData} />
            </div>
            <div className="order-6 lg:order-none">
              <DangerZone order={order} />
            </div>
          </div>
          <div className="contents lg:block lg:space-y-6">
            <div className="order-1 lg:order-none">
              <CustomerCard order={order} storeName={storeName} />
            </div>
            <div className="order-4 lg:order-none">
              <OrderStatusCard order={order} onChanged={setData} />
            </div>
          </div>
        </div>
      )}

      {order && <PackingSlip order={order} storeName={storeName} storeLine={settings?.address || STORE.city} storePhone={settings?.phoneDisplay || ""} />}
    </div>
  );
}
