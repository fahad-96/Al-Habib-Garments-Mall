import React from "react";
import { Link } from "react-router-dom";
import StatusPill from "../StatusPill";
import DashboardCard, { CardEmpty } from "./DashboardCard";
import { formatINR, timeAgo } from "../../../lib/format";

export default function RecentOrders({ orders = [] }) {
  return (
    <DashboardCard title="Recent orders" to="/admin/orders" linkLabel="All orders">
      {orders.length === 0 ? (
        <CardEmpty>No orders yet. Orders placed on the website appear here the moment they arrive.</CardEmpty>
      ) : (
        <ul className="divide-y divide-neutral-800">
          {orders.map((order) => (
            <li key={order.id}>
              <Link to={`/admin/orders/${order.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-neutral-900 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-medium tabular-nums text-paper">{order.orderNumber || "Order"}</span>
                    <span className="text-xs text-neutral-500">{timeAgo(order.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {order.customer?.name || "Customer"}
                    {order.customer?.city ? ` · ${order.customer.city}` : ""}
                  </p>
                </div>
                <span className="text-sm tabular-nums text-neutral-100 sm:justify-self-end sm:pl-2">{formatINR(order.total)}</span>
                <span className="col-start-2 row-start-2 justify-self-end sm:col-start-3 sm:row-start-1">
                  <StatusPill status={order.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
