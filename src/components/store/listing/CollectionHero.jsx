import React from "react";
import Breadcrumbs from "../../ui/Breadcrumbs";
import Img from "../../ui/Img";
import Reveal from "../../ui/Reveal";

// Collection header. Phones stack the photo above the copy (cropped from the bottom only, so a
// model keeps their head); from md the copy sits left and the whole photo, uncropped, sits right
// on the hairline. Collection art is shot on white, so it reads as one canvas with the page.
export default function CollectionHero({ collection, count, ready = true }) {
  const countText = ready && count != null ? `${count} ${count === 1 ? "piece" : "pieces"}` : "";
  return (
    <section className="md:border-b md:border-line">
      <div className="container pt-6 sm:pt-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Collections", to: "/collections" }, { label: collection.name }]} />
      </div>
      <div className="container mt-5 grid gap-y-6 sm:mt-7 md:mt-2 md:grid-cols-2 md:items-end md:gap-x-10 lg:gap-x-16 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative -mx-4 aspect-[16/10] overflow-hidden sm:-mx-6 sm:aspect-[2/1] md:order-2 md:mx-0 md:aspect-[4/3] md:max-h-[28rem]">
          <Img src={collection.imageUrl} alt="" eager className="absolute inset-0 h-full w-full object-cover object-top md:object-contain md:object-right-bottom" fallbackLabel={collection.name?.[0] || "AH"} />
        </div>
        <Reveal className="min-w-0 md:order-1 md:pb-10 lg:pb-14">
          <p className="eyebrow">Collection{countText ? ` · ${countText}` : ""}</p>
          <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight text-ink [overflow-wrap:anywhere] sm:text-5xl lg:text-6xl">{collection.name}</h1>
          {collection.description && <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-[15px]">{collection.description}</p>}
        </Reveal>
      </div>
    </section>
  );
}
