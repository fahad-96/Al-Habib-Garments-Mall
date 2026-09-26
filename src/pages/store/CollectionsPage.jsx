import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import Seo from "../../components/ui/Seo";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Img from "../../components/ui/Img";
import Reveal from "../../components/ui/Reveal";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

function CollectionCard({ collection, count, index }) {
  return (
    <Reveal as="li" delay={Math.min(index, 3) * 0.06}>
      <Link to={`/collections/${collection.slug}`} className="group block" aria-label={`${collection.name}, ${count} ${count === 1 ? "piece" : "pieces"}`}>
        <div className="img-frame aspect-[4/3]">
          <Img src={collection.imageUrl} alt="" eager={index < 2} className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]" fallbackLabel={collection.name?.[0] || "AH"} />
        </div>
        <div className="mt-4 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="eyebrow">{count} {count === 1 ? "piece" : "pieces"}</p>
            <h2 className="mt-1.5 font-display text-2xl leading-tight tracking-tight sm:text-3xl">{collection.name}</h2>
            {collection.description && <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">{collection.description}</p>}
          </div>
          <span className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center border border-neutral-300 transition-colors group-hover:border-ink sm:flex" aria-hidden="true">
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

// Name the edits that are actually in the store, so the description never promises one that is not.
const listNames = (names) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);
const seoDescription = (items) => {
  const names = items.map(({ collection }) => collection.name).filter(Boolean);
  return names.length
    ? `Edits put together at Al Habib Garments Mall, Kunzer: ${listNames(names)}.`
    : "Edits put together at Al Habib Garments Mall, Kunzer: pieces chosen to be worn together.";
};

export default function CollectionsPage() {
  const { collections, collectionProducts, catalogReady } = useShop();
  const items = useMemo(
    () =>
      collections
        .filter((c) => c && c.isActive !== false)
        .slice()
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((c) => ({ collection: c, count: collectionProducts(c).length })),
    [collections, collectionProducts]
  );

  return (
    <div className="container pb-20 pt-6 sm:pt-10 lg:pb-28">
      <Seo title="Collections" description={seoDescription(items)} />
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Collections" }]} />
      <Reveal className="mt-5 sm:mt-7">
        <p className="eyebrow">Collections</p>
        <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">Edits for the season</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">A few pieces chosen to be worn together, for the valley&rsquo;s weather and the everyday.</p>
      </Reveal>

      {!catalogReady ? (
        <ul className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:mt-14" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="mt-4 h-3 w-16" />
              <Skeleton className="mt-3 h-6 w-2/3" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="mt-8 border-t border-line">
          <EmptyState
            icon={Layers}
            title="No collections yet"
            description="Edits are put together through the season. Until then, the full range is open."
            action={
              <Button variant="secondary" to="/shop">
                Shop everything
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:mt-14 lg:gap-x-10 lg:gap-y-16">
          {items.map(({ collection, count }, i) => (
            <CollectionCard key={collection.slug} collection={collection} count={count} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
