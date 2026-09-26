import React from "react";

const SITE = "Al Habib Garments Mall";

// React 19 hoists <title>/<meta> rendered anywhere into <head>.
export default function Seo({ title, description, image, noindex = false, type = "website" }) {
  const full = title ? `${title} — ${SITE}` : `${SITE} — Kunzer, Tangmarg`;
  const desc = description || "Multi-brand menswear, womenswear and kidswear from Kunzer, Tangmarg. Jackets, hoodies, tees, track pants, bags and beanies. Order on WhatsApp.";
  return (
    <>
      <title>{full}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </>
  );
}
