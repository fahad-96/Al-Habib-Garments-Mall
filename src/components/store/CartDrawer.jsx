import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import Drawer from "../ui/Drawer";
import Button from "../ui/Button";
import QtyStepper from "../ui/QtyStepper";
import Img from "../ui/Img";
import EmptyState from "../ui/EmptyState";
import { formatINR } from "../../lib/format";
import { MAX_QTY_PER_LINE } from "../../lib/catalogUtils";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cartLines, cartCount, totals, updateCartQty, removeCartItem, settings } = useShop();
  const navigate = useNavigate();
  const remaining = settings.freeDeliveryOver > 0 ? settings.freeDeliveryOver - (totals.subtotal - totals.discount) : 0;

  return (
    <Drawer
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      title={`Your bag (${cartCount})`}
      footer={
        cartLines.length > 0 && (
          <div className="px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-semibold tabular-nums">{formatINR(totals.subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">{remaining > 0 ? `Add ${formatINR(remaining)} more for free delivery.` : settings.freeDeliveryOver > 0 ? "You qualify for free delivery." : ""}</p>
            <div className="mt-4 grid gap-2">
              <Button full onClick={() => { setCartOpen(false); navigate("/bag"); }}>
                Checkout on WhatsApp
              </Button>
              <Button full variant="secondary" onClick={() => { setCartOpen(false); navigate("/bag"); }}>
                View bag
              </Button>
            </div>
          </div>
        )
      }
    >
      {cartLines.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Your bag is empty" description="Add a few pieces and they will appear here." action={<Button variant="secondary" onClick={() => { setCartOpen(false); navigate("/shop"); }}>Start shopping</Button>} />
      ) : (
        <ul className="divide-y divide-line px-5">
          {cartLines.map((line) => (
            <li key={line.key} className="flex gap-4 py-4">
              <Link to={`/product/${line.slug}`} onClick={() => setCartOpen(false)} className="img-frame h-28 w-20 shrink-0">
                <Img src={line.image} alt={line.title} className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{line.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {line.color} · {line.size}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeCartItem(line.key)} className="-mr-1 p-1 text-neutral-500 hover:text-ink" aria-label="Remove">
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                {!line.available ? (
                  <p className="mt-2 text-xs text-red-600">No longer available in this size.</p>
                ) : (
                  <div className="mt-3 flex items-center justify-between">
                    <QtyStepper size="sm" value={line.qty} max={Math.min(line.stock, MAX_QTY_PER_LINE)} onChange={(v) => updateCartQty(line.key, v)} />
                    <span className="text-sm font-semibold tabular-nums">{formatINR(line.price * line.qty)}</span>
                  </div>
                )}
                {line.available && line.qty > line.stock && <p className="mt-1 text-xs text-red-600">Only {line.stock} left. Quantity will be adjusted.</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
