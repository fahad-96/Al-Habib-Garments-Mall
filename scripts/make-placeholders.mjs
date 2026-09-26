// Generates the monochrome site artwork used by dark bands and editorial pages
// (public/image/art/*.svg). Product photos live in public/image/products and are
// produced separately from open-source photography (see public/image/ATTRIBUTIONS.md).
//
//   node scripts/make-placeholders.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_ART = join(ROOT, "public/image/art");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ── Pattern library ──────────────────────────────────────────────────────────
// Each returns the inner content of a <pattern> plus its tile size.
// `s` is the stroke/fill colour (rgba), `s2` a stronger variant.
const PATTERNS = {
  solid: (s) => [24, `<path d="M0 12H24M12 0V24" stroke="${s}" stroke-width="0.6" opacity="0.5"/>`],
  linen: (s, s2) => [22, `<path d="M0 5H22M0 11H22M0 16H22" stroke="${s}" stroke-width="0.8"/><path d="M4 0V22M11 0V22M17 0V22" stroke="${s2}" stroke-width="0.6"/>`],
  oxford: (s) => [8, `<rect x="0" y="0" width="4" height="4" fill="${s}"/><rect x="4" y="4" width="4" height="4" fill="${s}"/>`],
  twill: (s) => [10, `<path d="M-2 12L12 -2M-2 2L2 -2M8 12L12 8" stroke="${s}" stroke-width="1.6"/>`],
  worsted: (s) => [6, `<path d="M-1 7L7 -1M-1 1L1 -1M5 7L7 5" stroke="${s}" stroke-width="0.7"/>`],
  pinstripe: (s) => [16, `<path d="M8 0V16" stroke="${s}" stroke-width="1"/>`],
  chalkstripe: (s) => [28, `<path d="M14 0V28" stroke="${s}" stroke-width="2" stroke-dasharray="3 2"/>`],
  plaid: (s, s2) => [72, `<rect x="24" y="0" width="14" height="72" fill="${s}"/><rect x="0" y="24" width="72" height="14" fill="${s}"/><path d="M6 0V72M56 0V72M0 6H72M0 56H72" stroke="${s2}" stroke-width="1.2"/>`],
  gingham: (s) => [40, `<rect x="0" y="0" width="20" height="20" fill="${s}"/><rect x="20" y="20" width="20" height="20" fill="${s}"/><rect x="20" y="0" width="20" height="20" fill="${s}" opacity="0.35"/><rect x="0" y="20" width="20" height="20" fill="${s}" opacity="0.35"/>`],
  herringbone: (s) => [24, `<path d="M0 12L12 0M0 24L12 12M12 0L24 12M12 12L24 24" stroke="${s}" stroke-width="1.4"/><path d="M12 0V24" stroke="${s}" stroke-width="0.5"/>`],
  tweed: (s, s2) => [30, `<circle cx="5" cy="7" r="1.6" fill="${s}"/><circle cx="19" cy="4" r="1.1" fill="${s2}"/><circle cx="26" cy="16" r="1.8" fill="${s}"/><circle cx="11" cy="21" r="1.3" fill="${s2}"/><circle cx="22" cy="26" r="1" fill="${s}"/><circle cx="3" cy="25" r="1.2" fill="${s2}"/><path d="M0 15H30" stroke="${s}" stroke-width="0.4"/>`],
  quilt: (s, s2) => [48, `<path d="M0 24L24 0L48 24L24 48Z" fill="none" stroke="${s}" stroke-width="1.4"/><circle cx="24" cy="24" r="1.6" fill="${s2}"/>`],
  cable: (s) => [36, `<path d="M6 0C6 9 18 9 18 18C18 27 6 27 6 36M18 0C18 9 30 9 30 18C30 27 18 27 18 36" fill="none" stroke="${s}" stroke-width="2.4" stroke-linecap="round"/><path d="M0 0V36M35 0V36" stroke="${s}" stroke-width="0.6"/>`],
  rib: (s) => [12, `<rect x="0" y="0" width="5" height="12" fill="${s}"/>`],
  melton: (s) => [5, `<circle cx="1" cy="1" r="0.7" fill="${s}"/><circle cx="3.5" cy="3.5" r="0.7" fill="${s}"/>`],
  denim: (s, s2) => [8, `<path d="M-1 9L9 -1M-1 1L1 -1M7 9L9 7" stroke="${s}" stroke-width="1.1"/><path d="M-1 5L5 -1" stroke="${s2}" stroke-width="0.4"/>`],
  jersey: (s) => [6, `<path d="M0 3H6" stroke="${s}" stroke-width="0.9"/><path d="M0 0H6" stroke="${s}" stroke-width="0.3"/>`],
  pique: (s) => [14, `<path d="M7 1L12 4V10L7 13L2 10V4Z" fill="none" stroke="${s}" stroke-width="0.9"/>`],
  embroidery: (s, s2) => [64, `<g fill="none" stroke="${s}" stroke-width="1.3"><circle cx="32" cy="32" r="4"/><path d="M32 18C36 24 36 28 32 28C28 28 28 24 32 18ZM32 46C36 40 36 36 32 36C28 36 28 40 32 46ZM18 32C24 36 28 36 28 32C28 28 24 28 18 32ZM46 32C40 36 36 36 36 32C36 28 40 28 46 32Z"/></g><circle cx="4" cy="4" r="1.5" fill="${s2}"/><circle cx="60" cy="60" r="1.5" fill="${s2}"/><circle cx="60" cy="4" r="1.5" fill="${s2}"/><circle cx="4" cy="60" r="1.5" fill="${s2}"/>`],
  brocade: (s, s2) => [80, `<g fill="none" stroke="${s}" stroke-width="1.2"><path d="M40 4L76 40L40 76L4 40Z"/><path d="M40 16L64 40L40 64L16 40Z"/><circle cx="40" cy="40" r="6"/><path d="M40 28C46 34 46 40 40 40C34 40 34 34 40 28ZM40 52C46 46 46 40 40 40C34 40 34 46 40 52Z"/></g><circle cx="40" cy="40" r="2" fill="${s2}"/><circle cx="0" cy="0" r="3" fill="${s2}"/><circle cx="80" cy="80" r="3" fill="${s2}"/><circle cx="80" cy="0" r="3" fill="${s2}"/><circle cx="0" cy="80" r="3" fill="${s2}"/>`],
  tilla: (s, s2) => [96, `<g fill="none" stroke="${s}" stroke-width="1.4" stroke-linecap="round"><path d="M8 88C20 60 30 60 40 72C50 84 60 80 62 66C64 52 50 44 40 52"/><path d="M40 52C30 60 26 46 36 38C46 30 62 36 70 24"/><path d="M70 24C76 16 84 14 90 10"/><path d="M52 60C58 56 64 58 66 64"/><path d="M28 70C24 76 22 82 24 88"/></g><circle cx="90" cy="10" r="2.4" fill="${s2}"/><circle cx="8" cy="88" r="2" fill="${s2}"/><circle cx="66" cy="64" r="1.8" fill="${s2}"/>`],
  aari: (s, s2) => [48, `<g fill="none" stroke="${s}" stroke-width="1.1"><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="4"/><path d="M24 4V12M24 36V44M4 24H12M36 24H44M10 10L15 15M38 38L33 33M38 10L33 15M10 38L15 33"/></g><circle cx="24" cy="24" r="1.6" fill="${s2}"/>`],
  chanderi: (s, s2) => [56, `<path d="M0 28H56M28 0V56" stroke="${s}" stroke-width="0.35"/><path d="M28 20L34 28L28 36L22 28Z" fill="${s2}"/><path d="M0 -4L4 0L0 4L-4 0Z" fill="${s2}"/><path d="M56 52L60 56L56 60L52 56Z" fill="${s2}"/>`],
  block: (s, s2) => [72, `<g fill="${s}"><path d="M36 10C42 18 42 26 36 30C30 26 30 18 36 10Z"/><path d="M36 62C42 54 42 46 36 42C30 46 30 54 36 62Z"/><path d="M10 36C18 30 26 30 30 36C26 42 18 42 10 36Z"/><path d="M62 36C54 30 46 30 42 36C46 42 54 42 62 36Z"/></g><circle cx="36" cy="36" r="3.5" fill="${s2}"/><circle cx="0" cy="0" r="2.5" fill="${s2}"/><circle cx="72" cy="72" r="2.5" fill="${s2}"/><circle cx="72" cy="0" r="2.5" fill="${s2}"/><circle cx="0" cy="72" r="2.5" fill="${s2}"/>`],
  floral: (s, s2) => [96, `<g fill="none" stroke="${s}" stroke-width="1.5"><circle cx="48" cy="48" r="7"/><path d="M48 24C58 34 58 42 48 44C38 42 38 34 48 24ZM48 72C58 62 58 54 48 52C38 54 38 62 48 72ZM24 48C34 38 42 38 44 48C42 58 34 58 24 48ZM72 48C62 38 54 38 52 48C54 58 62 58 72 48Z"/><path d="M12 84C22 78 30 84 34 92M84 12C74 18 66 12 62 4" stroke-width="1.2"/><path d="M70 74C80 70 86 76 90 86" stroke-width="1.2"/></g><circle cx="48" cy="48" r="2.5" fill="${s2}"/>`],
  sequin: (s, s2) => [16, `<circle cx="4" cy="4" r="2.6" fill="${s}"/><circle cx="12" cy="12" r="2.6" fill="${s2}"/><circle cx="12" cy="4" r="1" fill="${s2}"/><circle cx="4" cy="12" r="1" fill="${s}"/>`],
  khaddar: (s) => [12, `<path d="M0 3H12M0 9H12" stroke="${s}" stroke-width="2"/><path d="M3 0V12M9 0V12" stroke="${s}" stroke-width="2" opacity="0.6"/>`],
  handloom: (s, s2) => [60, `<rect x="0" y="4" width="60" height="6" fill="${s}"/><rect x="0" y="16" width="60" height="2" fill="${s2}"/><rect x="0" y="40" width="60" height="10" fill="${s}"/><rect x="0" y="54" width="60" height="1.5" fill="${s2}"/>`],
  paisley: (s, s2) => [110, `<g fill="none" stroke="${s}" stroke-width="1.5"><path d="M55 14C80 14 92 40 84 66C78 86 58 96 40 88C24 80 22 62 34 54C46 46 62 54 60 66C58 76 46 78 42 70"/><path d="M55 24C72 24 82 42 76 62"/><path d="M50 40C58 38 64 44 62 52"/></g><circle cx="55" cy="60" r="2" fill="${s2}"/><circle cx="12" cy="98" r="2" fill="${s2}"/>`],
  leather: (s) => [40, `<path d="M4 6L10 3L15 8L9 12ZM22 4L30 6L28 13L20 11ZM6 20L13 17L16 24L8 27ZM24 22L33 20L35 28L26 30ZM12 33L19 30L21 37L13 39ZM30 34L38 33L37 39L29 38Z" fill="${s}" opacity="0.7"/>`],
  suede: (s) => [4, `<circle cx="1" cy="1" r="0.5" fill="${s}"/><circle cx="3" cy="3" r="0.5" fill="${s}"/>`],
  felt: (s) => [7, `<circle cx="1.5" cy="1.5" r="0.9" fill="${s}"/><circle cx="5" cy="4.5" r="0.9" fill="${s}"/><circle cx="2" cy="6" r="0.5" fill="${s}"/>`],
  mesh: (s) => [16, `<path d="M8 0L16 4V12L8 16L0 12V4Z" fill="none" stroke="${s}" stroke-width="0.9"/>`],
  dots: (s) => [28, `<circle cx="7" cy="7" r="3" fill="${s}"/><circle cx="21" cy="21" r="3" fill="${s}"/>`],
  quilted: (s, s2) => [48, `<path d="M0 24L24 0L48 24L24 48Z" fill="none" stroke="${s}" stroke-width="1.4"/><circle cx="24" cy="24" r="1.6" fill="${s2}"/>`],
};
PATTERNS.quilt = PATTERNS.quilted;

const patternDef = (name, id, s, s2, scale = 1) => {
  const fn = PATTERNS[name] || PATTERNS.solid;
  const [size, body] = fn(s, s2);
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}" patternTransform="scale(${scale})">${body}</pattern>`;
};

// ── Site artwork (monochrome) ────────────────────────────────────────────────
const art = ({ w, h, pattern, dark = true, scale = 1.6, label = "" }) => {
  const bg = dark ? "#0a0a0a" : "#f4f4f4";
  const s = dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)";
  const s2 = dark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.24)";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<defs>
  ${patternDef(pattern, "p", s, s2, scale)}
  <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="0" stop-color="${dark ? "#ffffff" : "#ffffff"}" stop-opacity="${dark ? 0.05 : 0.5}"/><stop offset="1" stop-color="#000000" stop-opacity="${dark ? 0.55 : 0.1}"/></radialGradient>
</defs>
<rect width="${w}" height="${h}" fill="${bg}"/>
<rect width="${w}" height="${h}" fill="url(#p)"/>
<rect width="${w}" height="${h}" fill="url(#vig)"/>
</svg>`;
};

// ── Write ────────────────────────────────────────────────────────────────────
mkdirSync(OUT_ART, { recursive: true });
writeFileSync(join(OUT_ART, "strip-kashmir.svg"), art({ w: 1800, h: 800, pattern: "paisley", dark: true, scale: 2.6, label: "Kashmir artwork" }));
writeFileSync(join(OUT_ART, "about.svg"), art({ w: 1200, h: 1500, pattern: "tilla", dark: true, scale: 2, label: "About artwork" }));
writeFileSync(join(OUT_ART, "contact.svg"), art({ w: 1600, h: 900, pattern: "twill", dark: true, scale: 2, label: "Contact artwork" }));
console.log("Wrote 3 SVG artwork files.");
