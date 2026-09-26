import React, { useMemo } from "react";
import { useShop } from "../../context/ShopContext";
import { isNewProduct, sortProducts } from "../../lib/catalogUtils";
import Seo from "../../components/ui/Seo";
import ProductRail from "../../components/store/ProductRail";
import Reveal from "../../components/ui/Reveal";
import HomeHero from "../../components/store/home/HomeHero";
import DepartmentRow from "../../components/store/home/DepartmentRow";
import CategoryGrid from "../../components/store/home/CategoryGrid";
import FeaturedCollection from "../../components/store/home/FeaturedCollection";
import StripBanner from "../../components/store/home/StripBanner";
import ValueProps from "../../components/store/home/ValueProps";
import VisitStore from "../../components/store/home/VisitStore";
import InstagramBand from "../../components/store/home/InstagramBand";

const RAIL_LIMIT = 12;
const bySortOrder = (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0);
const time = (p) => new Date(p.createdAt || 0).getTime() || 0;
// Newest first; among equals, an explicit "New" badge wins, then the merchandised order.
const newestFirst = (a, b) => time(b) - time(a) || Number(b.badge === "New") - Number(a.badge === "New") || bySortOrder(a, b);

export default function HomePage() {
  const { products, banners, settings, recentProducts } = useShop();

  const heroBanners = useMemo(() => banners.filter((b) => b.placement === "hero" && b.isActive !== false).sort(bySortOrder), [banners]);
  const live = useMemo(() => products.filter((p) => p.isActive !== false), [products]);
  const newIn = useMemo(() => live.filter(isNewProduct).sort(newestFirst).slice(0, RAIL_LIMIT), [live]);
  const bestsellers = useMemo(() => sortProducts(live.filter((p) => p.badge === "Bestseller"), "recommended").slice(0, RAIL_LIMIT), [live]);

  return (
    <>
      <Seo />
      <HomeHero banners={heroBanners} settings={settings} />
      <DepartmentRow />
      {newIn.length > 0 && (
        <Reveal>
          <ProductRail className="mt-20 lg:mt-28" eyebrow="Just in" title="New in" description="Fresh from the mills and ateliers we know by name." to="/new" linkLabel="View all new" products={newIn} />
        </Reveal>
      )}
      <CategoryGrid />
      <FeaturedCollection />
      {bestsellers.length > 0 && (
        <Reveal>
          <ProductRail className="mt-20 lg:mt-28" eyebrow="Most loved" title="Bestsellers" description="The pieces Kunzer keeps coming back for." to="/shop?badge=Bestseller" linkLabel="Shop bestsellers" products={bestsellers} />
        </Reveal>
      )}
      <StripBanner />
      <ValueProps settings={settings} />
      <VisitStore settings={settings} />
      {recentProducts.length > 0 && (
        <Reveal>
          <ProductRail className="mt-20 lg:mt-28" eyebrow="Recently viewed" title="Pick up where you left off" products={recentProducts} />
        </Reveal>
      )}
      <InstagramBand settings={settings} />
    </>
  );
}
