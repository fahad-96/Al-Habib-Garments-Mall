import React from "react";
import { Link } from "react-router-dom";
import Img from "../../ui/Img";
import OrderCard from "./OrderCard";
import { formatINR, pluralize } from "../../../lib/format";
import { itemCount } from "./orderUtils";

// Lines are stored on the order as the SQL wrote them (snake_case keys).
export default function OrderItemsCard({ order }) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const count = itemCount(order);
  return (
    <OrderCard title="Items" aside={<span className="text-xs text-neutral-500">{pluralize(count, "item")}</span>} flush>
      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-neutral-500">No items were recorded on this order.</p>
      ) : (
        <ul className="divide-y divide-neutral-800">
          {items.map((item, i) => {
            const qty = Number(item?.qty) || 0;
            const price = Number(item?.price) || 0;
            const variant = [item?.color, item?.size].filter(Boolean).join(" / ");
            const title = item?.title || "Item";
            return (
              <li key={`${item?.slug || item?.product_id || i}-${item?.color || ""}-${item?.size || ""}`} className="flex items-start gap-4 px-5 py-4">
                <div className="img-frame aspect-[3/4] w-14 shrink-0 sm:w-16">
                  <Img src={item?.image} alt={title} className="h-full w-full object-cover" fallbackLabel="AH" />
                </div>
                <div className="min-w-0 flex-1">
                  {item?.slug ? (
                    <Link to={`/product/${item.slug}`} target="_blank" rel="noreferrer" className="line-clamp-2 text-sm font-medium text-paper underline-offset-4 hover:underline">
                      {title}
                    </Link>
                  ) : (
                    <p className="line-clamp-2 text-sm font-medium text-paper">{title}</p>
                  )}
                  {variant && <p className="mt-0.5 text-xs text-neutral-400">{variant}</p>}
                  <p className="mt-1.5 text-xs tabular-nums text-neutral-500">
                    {qty} × {formatINR(price)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums text-paper">{formatINR(qty * price)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </OrderCard>
  );
}
