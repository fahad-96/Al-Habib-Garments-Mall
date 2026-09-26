// Pure helpers that turn the raw fetchDashboard() payload into the numbers the
// dashboard shows. Kept free of React so they are easy to reason about.
import { LOW_STOCK_AT, variantStock } from "../../../lib/catalogUtils";

// Orders that count towards revenue: confirmed with the customer or further along.
export const REVENUE_STATUSES = ["confirmed", "packed", "shipped", "delivered"];
export const RECENT_ORDERS_LIMIT = 8;
export const LOW_STOCK_LIMIT = 10;

const DAY_MS = 86400000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getTime();
const at = (iso) => {
  const t = new Date(iso || 0).getTime();
  return Number.isFinite(t) ? t : 0;
};

export const greetingFor = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const longDate = (date = new Date()) => new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(date);

export const EMPTY_STATS = {
  ordersToday: 0,
  ordersYesterday: 0,
  ordersMonth: 0,
  deliveredMonth: 0,
  revenueMonth: 0,
  paidMonth: 0,
  awaiting: 0,
  oldestAwaitingAt: null,
  totalProducts: 0,
  activeProducts: 0,
  hiddenProducts: 0,
  units: 0,
  variantCount: 0,
  lowStockCount: 0,
  soldOutCount: 0,
  lowStock: [],
  recentOrders: [],
  pendingReviews: 0,
};

export function computeDashboardStats({ products = [], orders = [], pendingReviews = 0 } = {}, now = new Date()) {
  const dayStart = startOfDay(now);
  const yesterdayStart = dayStart - DAY_MS;
  const monthStart = startOfMonth(now);
  const revenue = new Set(REVENUE_STATUSES);

  const stats = { ...EMPTY_STATS, pendingReviews: Math.max(0, Number(pendingReviews) || 0) };

  for (const order of orders) {
    const created = at(order.createdAt);
    if (created >= dayStart) stats.ordersToday += 1;
    else if (created >= yesterdayStart) stats.ordersYesterday += 1;
    if (created >= monthStart) {
      stats.ordersMonth += 1;
      if (order.status === "delivered") stats.deliveredMonth += 1;
      if (revenue.has(order.status)) {
        stats.revenueMonth += Number(order.total) || 0;
        stats.paidMonth += 1;
      }
    }
    if (order.status === "new") {
      stats.awaiting += 1;
      if (!stats.oldestAwaitingAt || created < at(stats.oldestAwaitingAt)) stats.oldestAwaitingAt = order.createdAt;
    }
  }

  const active = products.filter((p) => p && p.isActive !== false);
  stats.totalProducts = products.length;
  stats.activeProducts = active.length;
  stats.hiddenProducts = products.length - active.length;

  const lowStock = [];
  for (const product of active) {
    for (const variant of product.variants || []) {
      const sizes = product.sizes?.length ? product.sizes : Object.keys(variant.stock || {});
      for (const size of sizes) {
        const n = variantStock(variant, size);
        stats.variantCount += 1;
        stats.units += n;
        if (n === 0) stats.soldOutCount += 1;
        else if (n <= LOW_STOCK_AT) lowStock.push({ productId: product.id, title: product.title, color: variant.color, size, stock: n });
      }
    }
  }
  lowStock.sort((a, b) => a.stock - b.stock || a.title.localeCompare(b.title) || a.color.localeCompare(b.color));
  stats.lowStockCount = lowStock.length;
  stats.lowStock = lowStock.slice(0, LOW_STOCK_LIMIT);

  stats.recentOrders = [...orders].sort((a, b) => at(b.createdAt) - at(a.createdAt)).slice(0, RECENT_ORDERS_LIMIT);

  return stats;
}
