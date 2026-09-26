import React from "react";
import Breadcrumbs from "../../ui/Breadcrumbs";
import Img from "../../ui/Img";

// Full-bleed art band with the collection name and description over a dark wash.
export default function CollectionHero({ collection, count, ready = true }) {
  const countText = ready && count != null ? `${count} ${count === 1 ? "piece" : "pieces"}` : "";
  return (
    <section className="relative aspect-[16/9] max-h-[30rem] w-full overflow-hidden bg-neutral-900 text-paper">
      <Img src={collection.imageUrl} alt="" eager className="absolute inset-0 h-full w-full object-cover" fallbackLabel={collection.name?.[0] || "AH"} />
      <div className="absolute inset-0 bg-ink/45" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" aria-hidden="true" />
      <div className="container relative flex h-full flex-col justify-between py-5 sm:py-8">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Collections", to: "/collections" }, { label: collection.name }]} className="[&_a]:text-paper/70 [&_a:hover]:text-paper [&_span]:text-paper/70 [&_[aria-current]]:text-paper" />
        <div className="max-w-2xl">
          <p className="eyebrow-dark text-paper/80">Collection{countText ? ` · ${countText}` : ""}</p>
          <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{collection.name}</h1>
          {collection.description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/85 sm:text-[15px]">{collection.description}</p>}
        </div>
      </div>
    </section>
  );
}
