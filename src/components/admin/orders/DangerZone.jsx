import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";
import { useShop } from "../../../context/ShopContext";
import { deleteOrder } from "../../../lib/adminApi";
import Button from "../../ui/Button";
import ConfirmDialog from "../ConfirmDialog";
import OrderCard from "./OrderCard";

export default function DangerZone({ order }) {
  const { supabase } = useAdmin();
  const { toast } = useShop();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const remove = async () => {
    if (!supabase) return;
    try {
      await deleteOrder(supabase, order.id);
      toast(`Order ${order.orderNumber || ""} deleted`.replace(/\s+/g, " "), { type: "success" });
      navigate("/admin/orders", { replace: true });
    } catch (e) {
      toast(e?.message || "Could not delete the order.", { type: "error" });
    }
  };

  const copy = order.stockApplied
    ? "This removes the order and its history for good. Its stock is still reserved, so cancel the order first if those pieces should go back on the shelf."
    : "This removes the order and its history for good. There is no undo.";

  return (
    <OrderCard title="Danger zone">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm leading-relaxed text-neutral-400">{copy}</p>
        <Button variant="inverse-outline" size="sm" onClick={() => setOpen(true)} className="shrink-0 self-start sm:self-auto">
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Delete order
        </Button>
      </div>
      <ConfirmDialog open={open} onClose={() => setOpen(false)} onConfirm={remove} title="Delete this order?" description={`${order.orderNumber || "This order"} will be removed permanently, along with its status history.`} confirmLabel="Delete order" danger />
    </OrderCard>
  );
}
