import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { getDiscount, isNewProduct, isSoldOut, primaryVariant, productHoverImage, productImage, isLowStock } from "../../lib/catalogUtils";
import { formatINR } from "../../lib/format";
import Img from "../ui/Img";
import Stars from "../ui/Stars";

export default function ProductCard({ product, eager = false, className = "", showRating = true }) {
  const { inWishlist, toggleWishlist, toast, ratingFor } = useShop();
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

  const onWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product.slug);
    toast(added ? "Saved to wishlist" : "Removed from wishlist", { type: "success", duration: 1800 });
  };

  return (
    <article className={`group relative ${className}`}>
      <Link to={`/product/${product.slug}`} className="block" aria-label={product.title}>
        <div className="img-frame aspect-[3/4]">
          <Img src={image} alt={product.title} eager={eager} className={`h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03] ${hover ? "group-hover:opacity-0" : ""}`} fallbackLabel="AH" />
          {hover && <Img src={hover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
          {badge && !soldOut && <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-2xs font-medium uppercase tracking-micro text-ink">{badge}</span>}
          {soldOut && (
            <div className="absolute inset-x-0 bottom-0 bg-paper/90 py-2 text-center text-2xs font-medium uppercase tracking-micro text-ink">Sold out</div>
          )}
          {!soldOut && low && <span className="absolute bottom-3 left-3 bg-ink px-2 py-1 text-2xs font-medium uppercase tracking-micro text-paper">Only few left</span>}
        </div>
      </Link>
      <button
        type="button"
        onClick={onWish}
        className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 ${wished ? "lg:opacity-100" : ""}`}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={wished}
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-ink" : ""}`} strokeWidth={1.5} />
      </button>
      <div className="mt-3 space-y-1">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="line-clamp-1 text-[13px] font-medium text-ink sm:text-sm">{product.title}</h3>
        </Link>
        <p className="line-clamp-1 text-xs text-neutral-500">{product.shortInfo || primary?.color}</p>
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold tabular-nums">{formatINR(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-xs tabular-nums text-neutral-400 line-through">{formatINR(product.mrp)}</span>
              <span className="text-2xs font-medium uppercase tracking-micro text-neutral-600">{off}% off</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between pt-0.5">
          {colorCount > 1 ? (
            <div className="flex items-center gap-1" aria-label={`${colorCount} colours`}>
              {product.variants.slice(0, 4).map((v) => (
                <span key={v.color} className="h-3 w-3 rounded-full border border-neutral-200" style={{ backgroundColor: v.hex }} title={v.color} />
              ))}
              {colorCount > 4 && <span className="text-2xs text-neutral-500">+{colorCount - 4}</span>}
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
