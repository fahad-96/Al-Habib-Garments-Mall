import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { pluralize } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Reveal from "../../components/ui/Reveal";
import ProductRail from "../../components/store/ProductRail";
import BagLine from "../../components/store/checkout/BagLine";
import OrderSummary from "../../components/store/checkout/OrderSummary";
import DeliveryForm from "../../components/store/checkout/DeliveryForm";
import MobileCheckoutBar from "../../components/store/checkout/MobileCheckoutBar";
import { useFitsViewport, useInView } from "../../components/store/checkout/hooks";

const FORM_ID = "checkout-form";
const STICKY_OFFSET = 96 + 24; // header + top gap, plus breathing room below

function EmptyBag({ wishlistProducts }) {
  return (
    <>
      <div className="container py-10 lg:py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Add a few pieces and they will appear here, ready to order on WhatsApp."
          action={<Button to="/shop">Start shopping</Button>}
        />
      </div>
      {wishlistProducts.length > 0 && <ProductRail className="mt-2 lg:mt-6" eyebrow="Saved for later" title="From your wishlist" products={wishlistProducts} to="/wishlist" linkLabel="View wishlist" />}
    </>
  );
}

export default function BagPage() {
  const { cartLines, cartCount, totals, updateCartQty, removeCartItem, addToCart, inWishlist, toggleWishlist, wishlistProducts, toast, placing } = useShop();
  const navigate = useNavigate();
  const asideRef = useRef(null);
  const submitRef = useRef(null);
  const asideFits = useFitsViewport(asideRef, STICKY_OFFSET);
  const ctaVisible = useInView(submitRef);

  const orderable = cartLines.some((l) => l.available);
  // Count what will actually be ordered (capped to stock, unavailable lines excluded) so it matches the summary.
  const headerCount = totals.itemCount > 0 ? totals.itemCount : cartCount;

  const remove = (line) => {
    removeCartItem(line.key);
    const canUndo = Boolean(line.product && line.available);
    toast("Removed from bag", canUndo ? { action: { label: "Undo", onClick: () => addToCart(line.product, line.color, line.size, Math.min(line.qty, line.stock)) } } : {});
  };

  const moveToWishlist = (line) => {
    if (!inWishlist(line.slug)) toggleWishlist(line.slug);
    removeCartItem(line.key);
    toast("Moved to wishlist", { type: "success", action: { label: "View", onClick: () => navigate("/wishlist") } });
  };

  return (
    <>
      <Seo title="Your bag" description="Review your bag and place the order on WhatsApp." noindex />
      {cartLines.length === 0 ? (
        <EmptyBag wishlistProducts={wishlistProducts} />
      ) : (
        <>
          <div className="container pb-36 pt-8 sm:pt-10 lg:pb-24 lg:pt-14">
            <Reveal as="header">
              <p className="eyebrow">Checkout</p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">Your bag</h1>
                <span className="text-sm tabular-nums text-neutral-500">{pluralize(headerCount, "item")}</span>
              </div>
            </Reveal>

            <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-20">
              <section className="lg:col-span-7" aria-label="Items in your bag">
                <ul className="divide-y divide-line border-y border-line">
                  {cartLines.map((line) => (
                    <BagLine key={line.key} line={line} onQty={(v) => updateCartQty(line.key, v)} onRemove={() => remove(line)} onMoveToWishlist={() => moveToWishlist(line)} />
                  ))}
                </ul>
                <Link to="/shop" className="group mt-6 inline-flex h-10 items-center gap-2 text-2xs font-medium uppercase tracking-micro text-ink">
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                  Continue shopping
                </Link>
              </section>

              <aside ref={asideRef} className={`mt-12 lg:col-span-5 lg:mt-0 ${asideFits ? "lg:sticky lg:top-24" : ""}`} aria-label="Order summary and delivery details">
                <OrderSummary />
                <DeliveryForm formId={FORM_ID} submitRef={submitRef} orderable={orderable} className="mt-10" />
              </aside>
            </div>
          </div>

          <MobileCheckoutBar total={totals.total} placing={placing} formId={FORM_ID} hidden={ctaVisible || !orderable} />
        </>
      )}
    </>
  );
}
