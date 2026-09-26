import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import Button from "../../ui/Button";
import Img from "../../ui/Img";
import Reveal from "../../ui/Reveal";
import ProductCard from "../ProductCard";

export default function FeaturedCollection() {
  const { collections, collectionProducts } = useShop();
  const collection = useMemo(() => [...collections].filter((c) => c.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))[0] || null, [collections]);
  const pieces = useMemo(() => (collection ? collectionProducts(collection) : []), [collection, collectionProducts]);
  const products = pieces.slice(0, 4);

  if (!collection) return null;
  const href = `/collections/${collection.slug}`;

  return (
    <section className="container mt-20 lg:mt-28">
      <div className="grid gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:gap-12 lg:pt-10">
        <Reveal className="lg:col-span-7">
          <Link to={href} className="img-frame group block aspect-[4/5] bg-neutral-100 sm:aspect-[4/3]" aria-label={`Shop ${collection.name}`}>
            {/* Collection art is landscape with the model right of centre (room for type on wide screens);
                the tall phone frame crops toward that side so the model is not cut in half. */}
            <Img src={collection.imageUrl} alt="" className="h-full w-full object-cover object-[75%_50%] transition-transform duration-700 ease-soft group-hover:scale-[1.02] sm:object-center" fallbackLabel={collection.name.slice(0, 1)} />
          </Link>
        </Reveal>
        <Reveal className="flex flex-col justify-center lg:col-span-5" delay={0.1}>
          <p className="eyebrow">The edit{pieces.length > 0 ? ` · ${pieces.length} pieces` : ""}</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight lg:text-5xl">{collection.name}</h2>
          {collection.description && <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-[15px]">{collection.description}</p>}
          <div className="mt-8">
            <Button to={href}>
              Shop the edit
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </div>
      {products.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:mt-10 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.06} y={10}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
