import React from "react";
import { isSoldOut } from "../../../lib/catalogUtils";

// schema.org Product markup so search engines can show price and availability.
export default function ProductJsonLd({ product, variant, images = [], rating, url = "", origin = "" }) {
  const abs = (src) => (/^https?:\/\//i.test(src) ? src : `${origin}${src}`);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images.filter(Boolean).map(abs),
    description: product.shortInfo || product.description || product.title,
    sku: product.slug,
    brand: { "@type": "Brand", name: product.brand || "Al Habib" },
    ...(variant?.color ? { color: variant.color } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: Number(product.price) || 0,
      availability: isSoldOut(product) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  if (rating?.count > 0) {
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: Number(Number(rating.average).toFixed(1)), reviewCount: rating.count };
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
