import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import { DEPARTMENTS } from "../../../data/catalog";
import Img from "../../ui/Img";
import Reveal from "../../ui/Reveal";

// Three edge-to-edge tiles that continue the hero as a mosaic.
export default function DepartmentRow() {
  const { categoriesFor } = useShop();
  const tiles = DEPARTMENTS.map((d) => ({ ...d, image: categoriesFor(d.key)[0]?.imageUrl || "" }));

  return (
    <section aria-label="Departments" className="mt-0.5">
      <div className="grid grid-cols-3 gap-0.5">
        {tiles.map((t, i) => (
          <Reveal key={t.key} delay={i * 0.08} y={10}>
            <Link to={`/shop/${t.key}`} className="img-frame group block aspect-[3/4] bg-ink lg:aspect-[4/5]">
              <Img src={t.image} alt="" className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]" fallbackLabel={t.name.slice(0, 1)} />
              <div className="absolute inset-0 bg-ink/10 transition-colors duration-500 group-hover:bg-ink/25" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-paper sm:p-6 lg:p-8">
                <p className="font-display text-xl leading-none sm:text-3xl lg:text-4xl">{t.name}</p>
                <p className="mt-2 hidden max-w-xs text-xs leading-relaxed text-neutral-300 md:block">{t.tagline}</p>
                <span className="mt-3 hidden items-center gap-2 text-2xs font-medium uppercase tracking-micro sm:inline-flex">
                  Shop {t.name.toLowerCase()}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
