// The shop's own name is not a brand anyone shops by, so it is left out of the eyebrow and the
// structured data; only named brands (a supplier's label the owner typed in) are shown.
const HOUSE_BRAND = "al habib";

const norm = (s) => String(s || "").trim().toLowerCase();

export const productBrand = (product, settings = {}) => {
  const brand = String(product?.brand || "").trim();
  const b = norm(brand);
  if (!b || b === HOUSE_BRAND || b === norm(settings?.storeName)) return "";
  return brand;
};
