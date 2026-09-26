import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { getDiscount, isNewProduct, isSoldOut, primaryVariant, productHoverImage, productImage, isLowStock } from "../../lib/catalogUtils";
import { formatINR } from "../../lib/format";
import Img, { CARD_SIZES } from "../ui/Img";
import Stars from "../ui/Stars";

export default function ProductCard({ product, eager = false, className = "", showRating = true, sizes = CARD_SIZES }) {
  const { inWishlist, toggleWishlist, toast, ratingFor } = useShop();
  // The second photo is fetched only once a mouse or pen actually hovers the card: touch screens
  // never show it, and loading it up front doubled the image bytes of every listing.
  const [hoverWanted, setHoverWanted] = useState(false);
  const [hoverReady, setHoverReady] = useState(false);
  const soldOut = isSoldOut(product);
  const low = isLowStock(product);
  const off = getDiscount(product);
  const image = productImage(product);
  const hover = productHoverImage(product);
  const wished = inWishlist(product.slug);
  const rating = ratingFor(product);
  const badge = product.badge === "Bestseller" ? "Bestseller" : product.badge === "Limited" ? "Limited" : isNewProduct(product) ? "New" : "";
  const primary = primaryVariant(product);
  const colorCount = product.variants?.length || 0;
  const href = `/product/${product.slug}`;

  const onWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product.slug);
    toast(added ? "Saved to wishlist" : "Removed from wishlist", { type: "success", duration: 1800 });
  };

  const onPointerEnter = (e) => {
    if (hover && !hoverWanted && e.pointerType !== "touch") setHoverWanted(true);
  };

  return (
    <article className={`group relative ${className}`} onPointerEnter={onPointerEnter}>
      {/* Mouse shortcut to the product; the title link below is the one keyboard and screen reader users get. */}
      <Link to={href} className="block" tabIndex={-1} aria-hidden="true">
        <div className="img-frame aspect-[3/4]">
          <Img src={image} alt={product.title} eager={eager} sizes={sizes} className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]" fallbackLabel="AH" />
          {/* Fades in over the first photo only once it has loaded, so the card never flashes empty. */}
          {hover && hoverWanted && (
            <Img
              src={hover}
              alt=""
              eager
              sizes={sizes}
              onLoad={() => setHoverReady(true)}
              className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ${hoverReady ? "group-hover:opacity-100" : ""}`}
            />
          )}
          {badge && !soldOut && <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-2xs font-medium uppercase tracking-micro text-ink">{badge}</span>}
          {soldOut && (
            <div className="absolute inset-x-0 bottom-0 bg-paper/90 py-2 text-center text-2xs font-medium uppercase tracking-micro text-ink">Sold out</div>
          )}
          {!soldOut && low && <span className="absolute bottom-3 left-3 bg-ink px-2 py-1 text-2xs font-medium uppercase tracking-micro text-paper">Only a few left</span>}
        </div>
      </Link>
      <button
        type="button"
        onClick={onWish}
        className={`absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 transition-opacity lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100 ${wished ? "lg:opacity-100" : ""}`}
        aria-label={wished ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
        aria-pressed={wished}
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-ink" : ""}`} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <div className="mt-3 space-y-1">
        <Link to={href} className="block">
          <h3 className="line-clamp-1 text-[13px] font-medium text-ink sm:text-sm">{product.title}</h3>
          {soldOut ? <span className="sr-only">, sold out</span> : low ? <span className="sr-only">, only a few left</span> : null}
        </Link>
        <p className="line-clamp-1 text-xs text-neutral-500">{product.shortInfo || primary?.color}</p>
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold tabular-nums">{formatINR(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-xs tabular-nums text-neutral-500 line-through">
                <span className="sr-only">Was </span>
                {formatINR(product.mrp)}
              </span>
              <span className="text-2xs font-medium uppercase tracking-micro text-neutral-600">{off}% off</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between pt-0.5">
          {colorCount > 1 ? (
            <div className="flex items-center gap-1">
              <span className="sr-only">{colorCount} colours</span>
              {product.variants.slice(0, 4).map((v) => (
                <span key={v.color} className="h-3 w-3 rounded-full border border-neutral-200" style={{ backgroundColor: v.hex }} title={v.color} aria-hidden="true" />
              ))}
              {colorCount > 4 && (
                <span className="text-2xs text-neutral-500" aria-hidden="true">
                  +{colorCount - 4}
                </span>
              )}
            </div>
          ) : (
            <span />
          )}
          {showRating && rating.count > 0 && <Stars value={rating.average} count={rating.count} />}
        </div>
      </div>
    </article>
  );
}
