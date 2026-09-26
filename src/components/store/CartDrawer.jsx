import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import Drawer from "../ui/Drawer";
import Button from "../ui/Button";
import QtyStepper from "../ui/QtyStepper";
import Img from "../ui/Img";
import EmptyState from "../ui/EmptyState";
import { formatINR } from "../../lib/format";
import { MAX_QTY_PER_LINE } from "../../lib/catalogUtils";

function DrawerLine({ line, desktop, onClose, onQty, onRemove }) {
  const { available } = line;
  // Same rules as the bag page: never show more than is in stock, and price what will be ordered.
  const qty = available ? Math.min(line.qty, line.stock) : line.qty;
  const max = Math.max(1, Math.min(line.stock, MAX_QTY_PER_LINE));
  const adjusted = available && line.qty > line.stock;
  const variant = [line.color, line.size].filter(Boolean).join(" · ");

  return (
    <li className="flex gap-4 py-4">
      <Link to={`/product/${line.slug}`} onClick={onClose} className={`img-frame h-28 w-20 shrink-0 ${available ? "" : "opacity-40"}`} tabIndex={-1} aria-hidden="true">
        <Img src={line.image} alt="" sizes="80px" className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/product/${line.slug}`} onClick={onClose} className={`block truncate text-sm font-medium underline-offset-4 hover:underline ${available ? "text-ink" : "text-neutral-500"}`}>
              {line.title}
            </Link>
            {variant && <p className="mt-0.5 text-xs text-neutral-500">{variant}</p>}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="-mr-2.5 -mt-2.5 inline-flex h-10 w-10 shrink-0 items-center justify-center text-neutral-500 transition-colors hover:text-ink"
            aria-label={`Remove ${line.title} from your bag`}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        {available ? (
          <>
            <div className="mt-3 flex items-center justify-between gap-3">
              <QtyStepper size={desktop ? "sm" : "md"} value={qty} max={max} onChange={onQty} />
              <span className="text-sm font-semibold tabular-nums">{formatINR(line.price * qty)}</span>
            </div>
            {adjusted && <p className="mt-2 text-xs text-neutral-600">Only {line.stock} left, quantity adjusted.</p>}
          </>
        ) : (
          <p className="mt-2 text-xs text-neutral-500">No longer available in this size.</p>
        )}
      </div>
    </li>
  );
}

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cartLines, cartCount, totals, updateCartQty, removeCartItem, settings } = useShop();
  const navigate = useNavigate();
  const desktop = useIsDesktop();
  const close = () => setCartOpen(false);
  const go = (to) => {
    close();
    navigate(to);
  };
  const freeFrom = Number(settings.freeDeliveryOver) || 0;
  const remaining = freeFrom > 0 ? freeFrom - (totals.subtotal - totals.discount) : 0;
  const orderable = cartLines.some((l) => l.available);
  const deliveryNote = !orderable || freeFrom <= 0 ? "" : remaining > 0 ? `Delivery is free from ${formatINR(freeFrom)}. Add ${formatINR(remaining)} more to get it.` : "Delivery is free on this order.";

  return (
    <Drawer
      open={cartOpen}
      onClose={close}
      title={cartCount > 0 ? `Your bag (${cartCount})` : "Your bag"}
      footer={
        cartLines.length > 0 && (
          <div className="px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-semibold tabular-nums">{formatINR(totals.subtotal)}</span>
            </div>
            {deliveryNote && <p className="mt-1 text-xs text-neutral-500">{deliveryNote}</p>}
            <Button full className="mt-4" onClick={() => go("/bag")}>
              Checkout
            </Button>
          </div>
        )
      }
    >
      {cartLines.length === 0 ? (
        <EmptyState icon={ShoppingBag} as="h3" title="Your bag is empty" description="Add a few pieces and they will appear here." action={<Button variant="secondary" onClick={() => go("/shop")}>Start shopping</Button>} />
      ) : (
        <ul className="divide-y divide-line px-5">
          {cartLines.map((line) => (
            <DrawerLine key={line.key} line={line} desktop={desktop} onClose={close} onQty={(v) => updateCartQty(line.key, v)} onRemove={() => removeCartItem(line.key)} />
          ))}
        </ul>
      )}
    </Drawer>
  );
}
