import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { DEPARTMENTS } from "../../data/catalog";
import { isNewProduct, isSoldOut, primaryVariant, relatedProducts } from "../../lib/catalogUtils";
import { buildProductEnquiry, openWhatsApp } from "../../lib/whatsapp";
import Seo from "../../components/ui/Seo";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Badge from "../../components/ui/Badge";
import Price from "../../components/ui/Price";
import Stars from "../../components/ui/Stars";
import ProductRail from "../../components/store/ProductRail";
import Gallery from "../../components/store/product/Gallery";
import VariantSelector from "../../components/store/product/VariantSelector";
import SizeGuideModal from "../../components/store/product/SizeGuideModal";
import BuyActions from "../../components/store/product/BuyActions";
import DeliveryInfo from "../../components/store/product/DeliveryInfo";
import DetailsAccordion from "../../components/store/product/DetailsAccordion";
import Reviews from "../../components/store/product/Reviews";
import StickyBuyBar from "../../components/store/product/StickyBuyBar";
import ProductJsonLd from "../../components/store/product/ProductJsonLd";
import { ProductNotFound, ProductSkeleton } from "../../components/store/product/ProductStates";
import { useProductSelection } from "../../components/store/product/useProductSelection";

const badgeFor = (product, soldOut) => {
  if (soldOut) return "Sold out";
  if (product.badge) return product.badge;
  return isNewProduct(product) ? "New" : "";
};

function RatingSummary({ rating, live, onClick }) {
  if (rating.count > 0) {
    return (
      <button type="button" onClick={onClick} className="mt-4 inline-flex h-8 items-center gap-2 text-xs transition-opacity hover:opacity-60">
        <Stars value={rating.average} size="sm" />
        <span className="font-medium tabular-nums">{Number(rating.average).toFixed(1)}</span>
        <span className="text-neutral-500 underline underline-offset-4">
          {rating.count} {rating.count === 1 ? "review" : "reviews"}
        </span>
      </button>
    );
  }
  if (!live) return <p className="mt-4 text-xs text-neutral-500">No reviews yet</p>;
  return (
    <button type="button" onClick={onClick} className="mt-4 inline-flex h-8 items-center text-xs text-neutral-500 underline underline-offset-4 hover:text-ink">
      Be the first to review
    </button>
  );
}

function ProductView({ product }) {
  const { products, getCategory, settings, ratingFor, sizeGuideFor, addToCart, setCartOpen, toast, inWishlist, toggleWishlist, recentProducts, pushRecent, isSupabaseConfigured } = useShop();
  const selection = useProductSelection(product);
  const [guideOpen, setGuideOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const ctaRef = useRef(null);
  const sizeRef = useRef(null);

  useEffect(() => {
    pushRecent(product.slug);
  }, [product.slug, pushRecent]);

  // The mobile buy bar appears once the main CTA has scrolled under the header and steps aside for the footer.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const cta = ctaRef.current?.getBoundingClientRect();
      const footer = document.querySelector("footer")?.getBoundingClientRect();
      const passed = Boolean(cta && cta.bottom < 64);
      const nearFooter = Boolean(footer && footer.top < window.innerHeight - 72);
      setBarVisible(passed && !nearFooter);
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const category = getCategory(product.categoryKey);
  const department = DEPARTMENTS.find((d) => d.key === product.department) || null;
  const rating = ratingFor(product);
  const soldOut = isSoldOut(product);
  const unavailable = soldOut || selection.colorSoldOut;
  const badge = badgeFor(product, soldOut);
  const wished = inWishlist(product.slug);
  const guide = sizeGuideFor(product);
  const variant = selection.variant;
  const images = useMemo(() => (variant?.images?.length ? variant.images : primaryVariant(product)?.images || []), [variant, product]);
  const related = useMemo(() => relatedProducts(product, products, 8), [product, products]);
  const recent = useMemo(() => recentProducts.filter((p) => p.slug !== product.slug).slice(0, 8), [recentProducts, product.slug]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const canonical = `${origin}/product/${product.slug}`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : canonical;

  const crumbs = [
    { label: "Home", to: "/" },
    department && { label: department.name, to: `/shop/${department.key}` },
    category && { label: category.name, to: `/shop/${category.department}/${category.slug}` },
    { label: product.title },
  ].filter(Boolean);

  const scrollToReviews = () => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const onAdd = () => {
    if (!selection.size) {
      selection.flagSizeError();
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const res = addToCart(product, variant?.color, selection.size, selection.qty);
    if (res.ok) {
      toast("Added to your bag", { type: "success", action: { label: "View bag", onClick: () => setCartOpen(true) } });
      setCartOpen(true);
    } else {
      toast(res.reason || "Could not add this to your bag.", { type: "error" });
    }
  };

  const onWhatsApp = () => {
    const text = unavailable
      ? `Hi ${settings.storeName}, is the ${product.title}${variant?.color ? ` in ${variant.color}` : ""} coming back in stock?\n${canonical}`
      : buildProductEnquiry({ storeName: settings.storeName, product, color: variant?.color, size: selection.size, qty: selection.qty, url: shareUrl });
    openWhatsApp(settings.whatsappNumber, text);
  };

  const onWish = () => {
    const added = toggleWishlist(product.slug);
    toast(added ? "Saved to wishlist" : "Removed from wishlist", { type: "success", duration: 1800 });
  };

  const onShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: product.title, text: product.shortInfo || product.title, url: shareUrl });
      } catch {
        /* the sheet was dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("Link copied", { type: "success", duration: 1800 });
    } catch {
      toast("Could not copy the link.", { type: "error" });
    }
  };

  return (
    <div className="pb-20 lg:pb-28">
      <Seo title={product.title} description={product.shortInfo || product.description} image={images[0]} type="product" />
      <ProductJsonLd product={product} variant={variant} images={images} rating={rating} url={canonical} origin={origin} />

      <div className="container">
        <Breadcrumbs items={crumbs} className="py-4 lg:py-6" />

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16">
          <div className="-mx-4 sm:mx-auto sm:max-w-lg lg:sticky lg:top-24 lg:col-span-7 lg:mx-0 lg:max-w-none lg:self-start">
            <Gallery key={variant?.color || "default"} images={images} alt={product.title} />
          </div>

          <div className="mt-7 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:max-w-none">
            <div className="lg:sticky lg:top-24">
              <div className="flex items-start justify-between gap-4">
                <p className="eyebrow">
                  {category ? (
                    <Link to={`/shop/${category.department}/${category.slug}`} className="hover:text-ink">
                      {category.name}
                    </Link>
                  ) : (
                    department?.name || "Shop"
                  )}
                  <span className="mx-2 text-neutral-300" aria-hidden="true">
                    /
                  </span>
                  {product.brand || "Al Habib"}
                </p>
                {badge && <Badge tone={soldOut ? "muted" : "light"}>{badge}</Badge>}
              </div>
              <h1 className="mt-3 font-display text-3xl leading-[1.05] tracking-tight text-balance sm:text-4xl">{product.title}</h1>
              {product.shortInfo && <p className="mt-3 text-sm leading-relaxed text-neutral-600">{product.shortInfo}</p>}
              <RatingSummary rating={rating} live={isSupabaseConfigured} onClick={scrollToReviews} />

              <div className="mt-6">
                <Price price={product.price} mrp={product.mrp} size="lg" />
                <p className="mt-1 text-xs text-neutral-500">Inclusive of all taxes</p>
              </div>

              <div className="mt-8">
                <VariantSelector product={product} selection={selection} productSoldOut={soldOut} onSizeGuide={() => setGuideOpen(true)} sizeRef={sizeRef} />
              </div>

              <div className="mt-8">
                <BuyActions ref={ctaRef} unavailable={unavailable} qty={selection.qty} maxQty={selection.maxQty} onQty={selection.setQty} onAdd={onAdd} onWhatsApp={onWhatsApp} wished={wished} onWish={onWish} onShare={onShare} />
              </div>

              <DeliveryInfo settings={settings} className="mt-8" />

              <div className="mt-8">
                <DetailsAccordion product={product} settings={settings} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="container mt-16 border-t border-line pt-12 lg:mt-24 lg:pt-16" aria-labelledby="reviews-heading">
        <Reviews product={product} rating={rating} />
      </section>

      <ProductRail className="mt-16 lg:mt-24" eyebrow="More like this" title="You may also like" products={related} to={category ? `/shop/${category.department}/${category.slug}` : "/shop"} linkLabel={category ? `All ${category.name.toLowerCase()}` : "Shop all"} />
      <ProductRail className="mt-16 lg:mt-24" eyebrow="Your history" title="Recently viewed" products={recent} />

      <SizeGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} guide={guide} product={product} settings={settings} />
      <StickyBuyBar visible={barVisible} product={product} size={selection.size} unavailable={unavailable} onAdd={onAdd} onWhatsApp={onWhatsApp} />
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { getProductBySlug, catalogReady } = useShop();
  const product = getProductBySlug(slug);
  if (!product) return catalogReady ? <ProductNotFound /> : <ProductSkeleton />;
  return <ProductView key={product.slug} product={product} />;
}
