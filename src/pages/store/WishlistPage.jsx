import React from "react";
import { Heart } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { pluralize } from "../../lib/format";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Reveal from "../../components/ui/Reveal";
import ProductCard from "../../components/store/ProductCard";
import TextButton from "../../components/store/checkout/TextButton";

const GRID = "grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4 lg:gap-x-6";

export default function WishlistPage() {
  const { wishlist, wishlistProducts, toggleWishlist, addToWishlist, toast } = useShop();
  const count = wishlistProducts.length;

  // Undo puts the piece back in the slot it came from (and never un-saves it if it was saved again meanwhile).
  const remove = (product) => {
    const index = wishlist.indexOf(product.slug);
    if (index === -1) return;
    const after = index > 0 ? wishlist[index - 1] : null;
    toggleWishlist(product.slug);
    toast("Removed from wishlist", { action: { label: "Undo", onClick: () => addToWishlist(product.slug, index, after) } });
  };

  return (
    <div className="container pb-20 pt-8 sm:pt-10 lg:pt-14">
      <Seo title="Wishlist" description="Pieces you have saved at Al Habib Garments Mall." noindex />

      <Reveal as="header">
        <p className="eyebrow">Saved</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">Wishlist</h1>
          {count > 0 && <span className="text-sm tabular-nums text-neutral-500">{pluralize(count, "item")}</span>}
        </div>
      </Reveal>

      {count === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap the heart on any piece to keep it here for later."
          action={<Button to="/shop">Start shopping</Button>}
          className="mt-4"
        />
      ) : (
        <ul className={`mt-8 lg:mt-12 ${GRID}`}>
          {wishlistProducts.map((p, i) => (
            <li key={p.slug}>
              <ProductCard product={p} eager={i < 4} />
              <TextButton onClick={() => remove(p)} className="mt-1" aria-label={`Remove ${p.title} from wishlist`}>
                Remove
              </TextButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
