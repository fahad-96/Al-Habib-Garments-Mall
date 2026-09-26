import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "Al Habib Garments Mall";
const DEFAULT_TITLE = `${SITE} — Kunzer, Tangmarg`;
const DEFAULT_DESCRIPTION = "Multi-brand menswear, womenswear and kidswear from Kunzer, Tangmarg. Jackets, hoodies, tees, track pants, bags and beanies. Order on WhatsApp.";
// Mirrors the static og:image block in index.html, restored when a page has no image of its own.
const DEFAULT_IMAGE = {
  src: "/og-image.png",
  type: "image/png",
  width: "1200",
  height: "630",
  alt: `${SITE}, Kunzer, Tangmarg. Menswear, womenswear and bags, ordered on WhatsApp.`,
};

const absoluteUrl = (url) => {
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return "";
  }
};

// Updates the single tag matching `selector` (creating it, or removing it when value is empty) and
// drops any duplicates, so each tag exists at most once however many pages have mounted.
function upsert(selector, create, attr, value) {
  const [el, ...extra] = document.head.querySelectorAll(selector);
  extra.forEach((node) => node.remove());
  if (!value) {
    el?.remove();
    return;
  }
  const node = el || document.head.appendChild(create());
  if (node.getAttribute(attr) !== value) node.setAttribute(attr, value);
}

const setMeta = (key, content) => {
  const attr = key.startsWith("og:") ? "property" : "name";
  upsert(
    `meta[${attr}="${key}"]`,
    () => {
      const m = document.createElement("meta");
      m.setAttribute(attr, key);
      return m;
    },
    "content",
    content
  );
};

const setCanonical = (href) =>
  upsert(
    'link[rel="canonical"]',
    () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    },
    "href",
    href
  );

// Page metadata. index.html carries the site-level tags for crawlers that do not run JavaScript;
// this updates those same tags in place on every page (never adds a second <title> or og tag).
// canonical defaults to the current path without its query string, so colour, filter, sort and
// page variants all point at the clean URL.
export default function Seo({ title, description, image, noindex = false, type = "website", canonical }) {
  const { pathname } = useLocation();
  const full = title ? `${title} — ${SITE}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    const url = canonical ? absoluteUrl(canonical) : `${window.location.origin}${path}`;
    const custom = image ? absoluteUrl(image) : "";

    document.title = full;
    setMeta("description", desc);
    setMeta("robots", noindex ? "noindex, nofollow" : "");
    setCanonical(noindex ? "" : url);
    setMeta("og:title", full);
    setMeta("og:description", desc);
    setMeta("og:type", type);
    setMeta("og:url", url);
    setMeta("og:image", custom || absoluteUrl(DEFAULT_IMAGE.src));
    setMeta("og:image:type", custom ? "" : DEFAULT_IMAGE.type);
    setMeta("og:image:width", custom ? "" : DEFAULT_IMAGE.width);
    setMeta("og:image:height", custom ? "" : DEFAULT_IMAGE.height);
    setMeta("og:image:alt", custom ? title || SITE : DEFAULT_IMAGE.alt);
  }, [full, desc, image, noindex, type, canonical, pathname, title]);

  return null;
}
