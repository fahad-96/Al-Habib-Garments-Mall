import React from "react";
import { isSoldOut } from "../../../lib/catalogUtils";
import { productBrand } from "./brand";

const PRICE_VALID_DAYS = 30;

// YYYY-MM-DD, `days` from today.
const isoDateIn = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const INDIA = { "@type": "DefinedRegion", addressCountry: "IN" };

// Exchanges within the window, sent back by courier or brought to the shop; the customer pays the
// return courier unless the piece arrived damaged (see the Returns section of /policies).
const returnPolicy = (returnDays) =>
  returnDays > 0
    ? {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: returnDays,
        returnMethod: ["https://schema.org/ReturnByMail", "https://schema.org/ReturnInStore"],
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      }
    : null;

// What delivering this one piece costs, by the same rule as computeTotals: free from the threshold.
const shippingFor = (price, settings) => {
  const fee = Number(settings.deliveryFee) || 0;
  const freeFrom = Number(settings.freeDeliveryOver) || 0;
  const rate = fee <= 0 || (freeFrom > 0 && price >= freeFrom) ? 0 : fee;
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: rate, currency: "INR" },
    shippingDestination: INDIA,
  };
};

// schema.org Product markup so search engines can show price, availability, delivery and returns.
export default function ProductJsonLd({ product, variant, images = [], rating, url = "", origin = "", settings = {} }) {
  const abs = (src) => (/^https?:\/\//i.test(src) ? src : `${origin}${src}`);
  const price = Number(product.price) || 0;
  const brand = productBrand(product, settings);
  const storeName = String(settings.storeName || "").trim();
  const policy = returnPolicy(Number(settings.returnDays) || 0);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images.filter(Boolean).map(abs),
    description: product.shortInfo || product.description || product.title,
    sku: product.slug,
    // The shop's own name is the seller, not a brand; only a named brand is marked up as one.
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(variant?.color ? { color: variant.color } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price,
      priceValidUntil: isoDateIn(PRICE_VALID_DAYS),
      availability: isSoldOut(product) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      ...(storeName ? { seller: { "@type": "Organization", name: storeName } } : {}),
      shippingDetails: shippingFor(price, settings),
      ...(policy ? { hasMerchantReturnPolicy: policy } : {}),
    },
  };
  if (rating?.count > 0) {
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: Number(Number(rating.average).toFixed(1)), reviewCount: rating.count };
  }
  // Escape every "<" so a "</script>" typed into a title or description cannot close the tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
