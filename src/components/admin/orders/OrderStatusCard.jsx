import React, { useState } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { useShop } from "../../../context/ShopContext";
import { setOrderStatus } from "../../../lib/adminApi";
import Button from "../../ui/Button";
import StatusPill from "../StatusPill";
import ConfirmDialog from "../ConfirmDialog";
import OrderCard from "./OrderCard";
import StatusFlow from "./StatusFlow";
import { NEXT_STEP, canCancel, statusDescription, statusLabel } from "./orderUtils";

export default function OrderStatusCard({ order, onChanged }) {
  const { supabase } = useAdmin();
  const { toast } = useShop();
  const [pending, setPending] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const next = NEXT_STEP[order.status];
  const cancellable = canCancel(order.status);

  const change = async (status) => {
    if (!supabase) return;
    setPending(status);
    try {
      const updated = await setOrderStatus(supabase, order.id, status);
      onChanged?.(updated);
      toast(`Order marked as ${statusLabel(status).toLowerCase()}`, { type: "success" });
    } catch (e) {
      toast(e?.message || "Could not update the status.", { type: "error" });
    } finally {
      setPending("");
    }
  };

  const cancelCopy = order.stockApplied
    ? "The reserved stock goes back on the shelf and the order is marked cancelled. The customer is not told automatically, so let them know on WhatsApp."
    : "The order is marked cancelled. No stock was reserved for it yet. The customer is not told automatically, so let them know on WhatsApp.";

  return (
    <OrderCard
      title="Status"
      aside={
        <>
          {order.stockApplied && <StatusPill tone="outline">Stock reserved</StatusPill>}
          <StatusPill status={order.status} />
        </>
      }
    >
      <p className="text-sm leading-relaxed text-neutral-300">{statusDescription(order.status)}</p>

      {next || cancellable ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {next && (
            <Button variant="inverse" size="sm" onClick={() => change(next.status)} loading={pending === next.status} disabled={Boolean(pending)}>
              {next.label}
            </Button>
          )}
          {cancellable && (
            <Button variant="inverse-outline" size="sm" onClick={() => setCancelOpen(true)} disabled={Boolean(pending)}>
              Cancel order
            </Button>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-neutral-500">This order is complete. Nothing more to do.</p>
      )}
      {next?.hint && <p className="mt-3 text-xs leading-relaxed text-neutral-500">{next.hint}</p>}
      {!order.stockApplied && order.status === "new" && <p className="mt-1 text-xs leading-relaxed text-neutral-500">Nothing is reserved until then, so check the shelf before you confirm.</p>}

      <StatusFlow status={order.status} history={order.statusHistory} />

      <ConfirmDialog open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={() => change("cancelled")} title="Cancel this order?" description={cancelCopy} confirmLabel="Yes, cancel it" danger />
    </OrderCard>
  );
}
