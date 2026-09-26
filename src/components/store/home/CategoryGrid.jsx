import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../../../context/ShopContext";
import { departmentName } from "../../../data/catalog";
import Img from "../../ui/Img";
import Reveal from "../../ui/Reveal";
import SectionHeading from "../../ui/SectionHeading";

// Curated order; anything missing from the catalog is back-filled with other active categories.
const CURATED = ["men-jackets", "women-jackets", "men-sweatshirts", "women-sweatshirts", "men-t-shirts", "women-tops", "accessories-bags", "men-track-pants"];
const LIMIT = 8;

// A hyphenated word ("T-Shirts") must not break at its hyphen on a narrow tile. A nowrap span keeps the
// display face's own hyphen, where a non-breaking hyphen character could fall back to another font.
const keepWordsWhole = (name) =>
  String(name || "")
    .split(/(\S*-\S*)/)
    .filter(Boolean)
    .map((part, i) =>
      part.includes("-") ? (
        <span key={i} className="whitespace-nowrap">
          {part}
        </span>
      ) : (
        part
      )
    );

// The eyebrow must stay on one line: "Bags & Accessories" wraps on a phone tile, and "Accessories" says enough there.
const tileDepartment = (key) => (key === "accessories" ? "Accessories" : departmentName(key));

export default function CategoryGrid() {
  const { categories, getCategory } = useShop();

  const tiles = useMemo(() => {
    const live = (c) => c && c.isActive !== false;
    const picked = CURATED.map((k) => getCategory(k)).filter(live);
    const seen = new Set(picked.map((c) => c.key));
    for (const c of categories) {
      if (picked.length >= LIMIT) break;
      if (live(c) && !seen.has(c.key)) {
        picked.push(c);
        seen.add(c.key);
      }
    }
    return picked.slice(0, LIMIT);
  }, [categories, getCategory]);

  if (!tiles.length) return null;

  return (
    <section className="container mt-20 lg:mt-28">
      <Reveal>
        <SectionHeading eyebrow="Browse" title="Shop by category" to="/shop" linkLabel="All categories" />
      </Reveal>
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-4 lg:mt-10">
        {tiles.map((c, i) => (
          <Reveal key={c.key} delay={(i % 4) * 0.06} y={10}>
            <Link to={`/shop/${c.department}/${c.slug}`} className="group block">
              <div className="img-frame aspect-[3/4] bg-ink">
                <Img src={c.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]" fallbackLabel={c.name.slice(0, 1)} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-ink/0 transition-opacity duration-500 group-hover:opacity-90" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-paper lg:p-5">
                  <p className="text-2xs font-medium uppercase tracking-micro text-neutral-300">{tileDepartment(c.department)}</p>
                  <p className="mt-1 font-display text-xl/none text-balance sm:text-2xl/none md:text-xl/none lg:text-3xl/none">{keepWordsWhole(c.name)}</p>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
