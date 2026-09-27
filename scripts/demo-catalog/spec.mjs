// Demo catalog spec: the copy, colours and mappings for the built-in demo catalog.
// build.mjs turns it into src/data/demo-products.js and the photos in public/image/products.
//
// Photos come from two places:
//   - SHOTS: product-only photos (no models) from seller listings on desertcart.in, for every
//     upper-body garment, the beanies and the travel bags. Other sellers' photos: demo use only,
//     the owner replaces them before selling (see public/image/ATTRIBUTIONS.md).
//   - APPAREL and BAGS: Magento Luma sample data (OSL 3.0) for the bottoms, which show legs but no
//     faces, and for the everyday bags.
// Every title, description, colour name and detail below was written from the photos themselves,
// not from the source listing's copy (which is often a keyword list or describes something else).
// When you change a photo mapping, open the photos and check the copy still matches what is in them.

// ── Colours ──────────────────────────────────────────────────────────────────
// One short vocabulary so the storefront's colour filter stays useful. A variant can override the
// hex when its shade differs from the default (["Name", "#hex"]).
export const COLOR_HEX = {
  Black: "#1a1a1a", White: "#f4f4f4", Cream: "#efe7d6", "Heather grey": "#cfcfcc", Grey: "#8c8c8c", Silver: "#c4c3c6",
  Charcoal: "#4a4749", Slate: "#4b4a5c", Navy: "#232b4a", Blue: "#2f55c4", "Sky blue": "#5aaaf0", Indigo: "#3f3584",
  Teal: "#2aa0a6", Mint: "#9ad8bf", Sage: "#aeb8a8", Green: "#1f7a52", "Bottle green": "#1f4a3d", Olive: "#6b6450",
  Khaki: "#a89f86", Sand: "#d8cdb4", Tan: "#c69c6d", Brown: "#735752", Yellow: "#e8df8a", Lime: "#d8e46a",
  Mustard: "#d69640", Orange: "#ec7d3c", Rust: "#b04a32", Peach: "#f6b672", Coral: "#ec7a7f", Pink: "#f098ab",
  Red: "#c0282a", Maroon: "#6e2230", Berry: "#9c3a78", Purple: "#5b44a0", Lavender: "#a8a0d6", Multicolour: "#c98a4a",
};

// Magento's own colour names, used when a product does not rename a colour.
export const COLOR_RENAME = { Gray: "Grey" };

const WASH = "Machine wash cold with similar colours. Do not bleach. Tumble dry low or line dry.";
const WASH_BAG = "Wipe clean with a damp cloth. Air dry away from direct heat.";
const WASH_WOOL = "Hand wash cold. Reshape and dry flat.";
const WASH_COAT = "Dry clean, or spot clean with a damp cloth. Hang to air.";
const WASH_LINEN = "Hand wash or gentle machine wash cold. Line dry in the shade and iron while slightly damp.";
const WASH_SPOT = "Spot clean with a damp cloth. Air dry away from direct heat.";

// ── Categories the demo products use: [key, size set, category photo] ───────
// A photo reference is "Product title/Colour" for a SHOTS product, or "SKU/Magento colour" for Magento.
// Names and descriptions live in src/data/catalog.js (CATEGORIES); build.mjs checks they agree.
// The order here is also the order products are interleaved in, so "New in" mixes categories.
export const CATEGORIES = [
  ["men-jackets", "apparel", "Quilted Check Shacket/Red"],
  ["women-tops", "apparel", "Embroidered Linen Top/Mustard"],
  ["men-sweatshirts", "apparel", "Chevron Colour-Block Hoodie/Multicolour"],
  ["women-jackets", "apparel", "Longline Puffer Coat/Navy"],
  ["men-t-shirts", "apparel", "Classic Crew Tee/Maroon"],
  ["women-sweatshirts", "apparel", "Oversized Zip Hoodie/Red"],
  ["accessories-bags", "free", "Hard-Shell Spinner Trolley, 24 in/Navy"],
  ["men-track-pants", "waist", "MP07/Blue"],
  ["women-leggings", "apparel", "WP04/Blue"],
  ["accessories-beanies", "free", "Striped Pom-Pom Beanie/Olive"],
  ["men-shorts", "waist", "MSH05/Gray"],
  ["men-vests", "apparel", "Ribbed Vest, Pack of 3/Multicolour"],
].map(([key, sizeSet, image]) => ({ key, department: key.split("-")[0], sizeSet, image }));

// ── Bottoms (Magento configurable SKUs) ─────────────────────────────────────
// colors:     { MagentoColour: "Name" | ["Name", "#hex"] } renames a colour (all photographed colours are used)
// omit:       Magento colours to leave out
// skip:       photo file names (without .jpg) to leave out, e.g. detail shots in a different shade
// highlights: short, factual bullets for the Product details table (only what the photos show)
// more:       replaces the category's rotating second paragraph
const A = (sku, cat, title, short, price, mrp, extra = {}) => ({ sku, cat, title, short, price, mrp, badge: "", details: {}, tags: [], highlights: [], ...extra });

export const APPAREL = [
  // Men · track pants
  A("MP01", "men-track-pants", "Knit Warm-Up Track Pant", "Straight-leg heathered knit with a drawstring waist.", 1199, 1599, {
    badge: "Bestseller",
    colors: { Purple: "Lavender" },
    details: { fabric: "Heathered knit", fit: "Straight", closure: "Drawstring waist" },
  }),
  A("MP02", "men-track-pants", "Fleece-Lined Track Pant", "Straight-leg track pant with a soft fleece lining and an elastic waist.", 1499, 1899, {
    colors: { Gray: "Charcoal", Blue: ["Blue", "#1b7fcc"], Red: "Maroon" },
    details: { fabric: "Polyester knit, fleece lined", fit: "Straight", closure: "Elastic waist" },
    tags: ["winter"],
  }),
  A("MP03", "men-track-pants", "Straight Jogging Pant", "Light, straight-leg jogging pant with an elastic waist.", 1299, 1699, {
    details: { fabric: "Soft performance knit", fit: "Straight", closure: "Elastic waist" },
  }),
  A("MP04", "men-track-pants", "Cotton Sport Pant", "Dark heather cotton with side pockets and a straight leg.", 1299, 1699, {
    colors: { Gray: "Charcoal" },
    details: { fabric: "Cotton blend", fit: "Straight", closure: "Elastic waist" },
  }),
  A("MP05", "men-track-pants", "Cotton Gym Pant", "Stretch and support in a straight cotton leg.", 1499, 1899, {
    skip: ["mp05-blue_back"],
    details: { fabric: "Stretch cotton", fit: "Straight", closure: "Drawstring waist" },
  }),
  A("MP06", "men-track-pants", "Ankle-Zip Warm-Up Pant", "Light woven warm-up pant with an elastic waist and ankle zips.", 999, 1399, {
    colors: { Orange: "Peach" },
    details: { fabric: "Lightweight woven polyester", fit: "Relaxed", closure: "Elasticised waist, ankle zips" },
  }),
  A("MP07", "men-track-pants", "Weather-Resistant Track Pant", "Fast-drying woven shell with ankle zips, reflective piping and an elastic drawcord waist.", 1799, 2299, {
    badge: "New",
    colors: { Blue: ["Blue", "#1a8fd0"] },
    skip: ["mp07-blue_alt1", "mp07-blue_back"],
    details: { fabric: "Weather-resistant woven shell, mesh lined", fit: "Regular", closure: "Elastic drawcord" },
    highlights: ["Ankle zips", "Reflective piping"],
    tags: ["rain"],
  }),
  A("MP08", "men-track-pants", "Belted Cargo Pant", "Lightweight cargo pant with a webbing belt and deep side pockets.", 1699, 2199, {
    colors: { Blue: ["Blue", "#1a8fe0"], Red: ["Red", "#b0141e"] },
    skip: ["mp08-green_alt1", "mp08-green_back"],
    details: { fabric: "Lightweight quick-dry nylon", fit: "Straight", closure: "Belted waist" },
    highlights: ["Cargo pockets", "Webbing belt included"],
    tags: ["travel"],
  }),
  A("MP10", "men-track-pants", "Side-Stripe Track Pant", "Straight track pant with a contrast stripe down the side.", 1399, 1799, {
    details: { fabric: "Soft performance knit", fit: "Straight", closure: "Elastic waist" },
  }),
  A("MP11", "men-track-pants", "Convertible Cargo Pant", "Zip-off legs turn it into shorts, with cargo pockets and a webbing belt.", 1899, 2399, {
    colors: { Brown: "Khaki" },
    details: { fabric: "Lightweight stretch, water repellent", fit: "Regular", closure: "Belted waist, zip-off legs" },
    highlights: ["Cargo pockets", "Webbing belt included"],
    tags: ["travel"],
  }),
  A("MP12", "men-track-pants", "Cuffed Cotton Jogger", "Relaxed cotton-blend jogger with cuffed ankles and a drawstring waist.", 1199, 1599, {
    omit: ["Blue"],
    details: { fabric: "Cotton, recycled polyester, spandex", fit: "Relaxed, cuffed ankle", closure: "Drawstring waist" },
  }),
  // Men · shorts
  A("MSH01", "men-shorts", "Ventilated Fitness Short", "Light, knee-length short that keeps you cool for the distance.", 899, 1199, {
    colors: { Red: "Coral" },
    skip: ["msh01-blue_back"],
    details: { fabric: "Lightweight performance weave", fit: "Regular", closure: "Elastic waist", length: "9 inch inseam" },
  }),
  A("MSH03", "men-shorts", "Lightweight Workout Short", "Breathable woven short with an adjustable waist.", 799, 1099, {
    colors: { Blue: ["Blue", "#1690cc"] },
    skip: ["msh03-blue_alt1", "msh03-blue_back"],
    details: { fabric: "Lightweight polyester", fit: "Regular", closure: "Interior drawstring", length: "7 inch inseam" },
  }),
  A("MSH04", "men-shorts", "Mesh Training Short", "Long, breathable mesh short with an elastic waist.", 849, 1099, {
    colors: { Purple: "Lavender", Yellow: "Lime" },
    details: { fabric: "Breathable mesh knit", fit: "Relaxed", closure: "Elastic waist", length: "Knee length" },
  }),
  A("MSH05", "men-shorts", "Side-Stripe Training Short", "Knee-length training short with a contrast side stripe.", 749, 999, {
    badge: "Bestseller",
    colors: { Gray: "Charcoal" },
    details: { fabric: "Performance knit", fit: "Standard", closure: "Elastic waist", length: "Knee length" },
  }),
  A("MSH06", "men-shorts", "Panelled Training Short", "Soft, flexible short with seam panels and an integrated liner.", 799, 1099, {
    colors: { Gray: "Slate", Blue: ["Blue", "#1a82cc"] },
    skip: ["msh06-gray_alt1"],
    details: { fabric: "Soft stretch knit with liner", fit: "Regular", closure: "Elastic waist", length: "Knee length" },
  }),
  A("MSH07", "men-shorts", "Compression-Lined Sports Short", "Compression liner under a wicking outer, with a contrast side stripe.", 899, 1199, {
    details: { fabric: "Wicking polyester, compression liner", fit: "Regular", closure: "Elastic waist" },
  }),
  A("MSH08", "men-shorts", "Contrast-Hem Sports Short", "Knee-length short with a contrast panel at the back hem and a built-in brief.", 899, 1199, {
    details: { fabric: "Wicking polyester", fit: "Regular", closure: "Elasticised waist", length: "Knee length" },
  }),
  A("MSH10", "men-shorts", "Active Jersey Short", "Ultra-breathable jersey with a flat comfort waistband.", 749, 999, {
    colors: { Blue: "Sky blue" },
    details: { fabric: "Jersey with mesh detail", fit: "Regular", closure: "Flat comfort waistband" },
  }),
  // Women · leggings & track pants
  A("WP01", "women-leggings", "Heathered Slim Leggings", "Slim, heathered leggings with a wide, comfortable waistband.", 1199, 1599, {
    colors: { Gray: "Charcoal", White: "Heather grey" },
    details: { fabric: "Soft heathered stretch knit", fit: "Slim", closure: "Wide elastic waistband" },
  }),
  A("WP02", "women-leggings", "Everyday Leggings", "Body-hugging leggings in a soft heathered knit.", 999, 1399, {
    badge: "Bestseller",
    colors: { Blue: "Lavender", Red: "Coral" },
    details: { fabric: "Heathered stretch knit", fit: "Body hugging", closure: "Low-rise elastic waist" },
  }),
  A("WP03", "women-leggings", "Cuffed Cargo Jogger", "Ruched cargo jogger with contrast tabs, cuffed ankles and a drawstring waist.", 1399, 1799, {
    colors: { Purple: "Indigo" },
    details: { fabric: "Lightweight parachute fabric", fit: "Relaxed, cuffed ankle", closure: "Drawstring waist" },
    highlights: ["Cargo pockets", "Ruched legs"],
  }),
  A("WP04", "women-leggings", "Parachute Pant", "Relaxed, ruched parachute pant with a drawstring waist.", 1499, 1899, {
    colors: { Blue: ["Heather grey", "#c4c5ca"], Black: "Charcoal" },
    details: { fabric: "Parachute fabric, antimicrobial finish", fit: "Relaxed", closure: "Drawstring waist" },
    highlights: ["Ruched legs"],
  }),
  A("WP05", "women-leggings", "Ruched-Ankle Leggings", "Opaque, high-stretch heathered leggings with ruched ankles.", 1499, 1899, {
    colors: { Blue: ["Blue", "#2b6fa8"], Red: "Pink" },
    details: { fabric: "Opaque high-stretch knit", fit: "Fitted", closure: "Deep elasticated waistband" },
  }),
  A("WP06", "women-leggings", "Stretch Tights", "Stretch running tights with mesh panels at the calf.", 1199, 1599, {
    colors: { Blue: "Teal", Orange: "Peach" },
    details: { fabric: "Stretch performance knit, mesh panels", fit: "Fitted", closure: "Elastic waist" },
  }),
];

// ── Bags (Magento gear fixtures; photos come from images_gear_bags.csv) ──────
// colors: { photo colour token (from the file name): "Name" | ["Name", "#hex"] }, in display order
const B = (sku, colors, title, short, price, mrp, extra = {}) => ({ sku, colors, title, short, price, mrp, cat: "accessories-bags", badge: "", details: {}, tags: [], highlights: [], ...extra });
export const BAGS = [
  B("24-MB01", { blue: "Navy" }, "Sport Duffle Bag", "Roomy barrel duffle with dual handles and an adjustable shoulder strap.", 1499, 1999, { badge: "Bestseller", details: { fabric: "Polyester", closure: "Full-length zip", dimensions: "50 × 28 × 28 cm" }, tags: ["travel"] }),
  B("24-MB02", { blue: "Blue", gray: "Grey" }, "Two-Compartment Backpack", "Two large zip compartments, a bungee-cord front and side mesh pouches.", 1299, 1699, { details: { fabric: "Polyester", closure: "Zip", dimensions: "45 × 30 × 15 cm" }, tags: ["school", "travel"] }),
  B("24-MB03", { black: "Black" }, "Summit Backpack", "Padded, adjustable straps and two-way zips, rugged enough for day hikes.", 1599, 2099, { badge: "New", details: { fabric: "Ripstop polyester", closure: "Two-way zips", dimensions: "50 × 35 × 30 cm" }, tags: ["travel"] }),
  B("24-MB04", { black: "Black" }, "Shoulder Sling Pack", "Zip main compartment, front pocket and a phone pocket on the strap.", 899, 1199, { details: { fabric: "Polyester", closure: "Zip", dimensions: "34 × 22 × 12 cm" } }),
  B("24-MB05", { black: "Black" }, "Messenger Bag", "Dual-buckle flap with an organiser panel and room for a laptop.", 1699, 2199, { details: { fabric: "Polyester canvas", closure: "Dual buckle flap", dimensions: "40 × 30 × 12 cm" }, tags: ["work"] }),
  B("24-MB06", { gray: "Grey" }, "Field Messenger", "Soft, textured messenger with two buckled front pockets and a roomy interior.", 1899, 2499, { details: { fabric: "Textured faux leather", closure: "Flap with buckles", dimensions: "38 × 28 × 12 cm" }, tags: ["work"] }),
  B("24-UB02", { black: "Black" }, "Wheeled Travel Duffle", "Rolling duffle with wheels, grab handles and a wide zip opening for weekends away.", 1999, 2599, { badge: "Bestseller", details: { fabric: "Polyester", closure: "U-shaped zip", dimensions: "60 × 30 × 30 cm" }, highlights: ["Wheels at the base"], tags: ["travel"] }),
  B("24-WB01", { black: "Black" }, "Everyday Zip Tote", "Spacious tote that zips shut and fits inside a locker.", 999, 1299, { details: { fabric: "Polyester", closure: "Zip", dimensions: "40 × 32 × 14 cm" } }),
  B("24-WB02", { green: ["Green", "#5aa82f"] }, "Track Tote", "Dual top handles, a zip top and a curved front pocket.", 1199, 1499, { details: { fabric: "Nylon", closure: "Zip", dimensions: "45 × 30 × 15 cm" } }),
  B("24-WB03", { purple: "Lavender" }, "Ripstop Backpack", "Tough ripstop with a black base and padded straps.", 1399, 1799, { details: { fabric: "Ripstop polyester", closure: "Zip", dimensions: "42 × 30 × 16 cm" }, tags: ["school"] }),
  B("24-WB04", { blue: "Grey" }, "Commuter Messenger", "Sized for a laptop and a change of clothes, with a sky-blue centre stripe.", 1499, 1999, { details: { fabric: "Polyester", closure: "Flap with buckles", dimensions: "40 × 30 × 12 cm" }, tags: ["work"] }),
  B("24-WB05", { red: ["Pink", "#d4a0a8"] }, "Shoulder Tote", "Top-loading compartment with a zip front pocket for essentials.", 1099, 1399, { details: { fabric: "Nylon", closure: "Zip", dimensions: "36 × 28 × 12 cm" } }),
  B("24-WB06", { red: "Pink" }, "Daytrip Backpack", "A dedicated laptop sleeve and two extra compartments.", 1499, 1899, { details: { fabric: "Polyester", closure: "Zip", dimensions: "44 × 30 × 16 cm" }, tags: ["school"] }),
  B("24-WB07", { brown: "Tan" }, "Overnight Duffle", "Water-resistant holdall with long handles for long weekends.", 1799, 2299, { badge: "New", details: { fabric: "Water-resistant polyester", closure: "Zip", dimensions: "55 × 30 × 28 cm" }, tags: ["travel"] }),
];

// ── Product-only photos (SHOTS) ──────────────────────────────────────────────
// Seller listings on desertcart.in. Their photos are served from m.media-amazon.com/images/I/<id>.jpg;
// build.mjs downloads each one once into a local cache, trims the white margin, centres the product on a
// clean 900 × 1200 white card and writes it into public/image/products, so the site never links out.
// V(colour, listing, ...photo ids): colour is "Name" or ["Name", "#hex"]; listing is the desertcart product
// number the photos come from (desertcart.in/products/<number>). The first photo leads.
const V = (color, listing, ...photos) => ({ color, listing, photos });
const S = (cat, title, short, price, mrp, variants, extra = {}) => ({ cat, title, short, price, mrp, variants, badge: "", details: {}, tags: [], highlights: [], ...extra });
const BEANIE = (title, short, price, mrp, variants, extra = {}) =>
  S("accessories-beanies", title, short, price, mrp, variants, { ...extra, details: { fit: "One size", ...extra.details }, tags: ["winter", ...(extra.tags || [])] });

export const SHOTS = [
  // Men · jackets
  S("men-jackets", "Quilted Check Shacket", "Brushed check flannel over a quilted lining, with snap buttons and two flap chest pockets.", 2499, 3299, [V(["Red", "#9e2a30"], "888660357", "81wuA9rhxpL")], {
    badge: "Bestseller",
    details: { fabric: "Brushed check flannel", lining: "Quilted padding", fit: "Regular", closure: "Snap buttons", neck: "Shirt collar", pattern: "Red and black check" },
    highlights: ["Two flap chest pockets", "Quilted lining"],
    tags: ["winter", "autumn"],
    more: "A shirt you wear as a jacket: warm enough for October evenings in Tangmarg, and easy to layer over a sweatshirt when the cold sets in.",
  }),
  S("men-jackets", "Camo Print Hooded Puffer", "Padded, hooded puffer in a tonal blue camo print, with zip hand pockets and elasticated cuffs.", 3299, 4299, [V(["Slate", "#4b5d74"], "595266582", "61SfqDf-YsL", "61DoQLkQ+KL")], {
    badge: "New",
    details: { fabric: "Polyester shell, padded fill", fit: "Regular", closure: "Full zip", neck: "Fixed hood", pattern: "Tonal camo" },
    highlights: ["Zip hand pockets", "Elasticated cuffs and hem"],
    tags: ["winter"],
  }),
  S("men-jackets", "Borg-Lined Corduroy Jacket", "Grey corduroy trucker jacket with a warm borg collar and lining, a button front and a flap chest pocket.", 2999, 3899, [V(["Grey", "#77757a"], "595273975", "719eDQmYXDL")], {
    details: { fabric: "Cotton corduroy", lining: "Faux-shearling borg", fit: "Regular", closure: "Button front", neck: "Borg collar" },
    highlights: ["Flap chest pocket", "Slant hand pockets"],
    tags: ["winter", "autumn"],
  }),
  S("men-jackets", "Packable Puffer Jacket", "Light, stitch-through puffer with a stand collar that packs into its own pouch.", 2799, 3599, [V(["Maroon", "#6f302d"], "888707486", "61I9FNTafEL")], {
    details: { fabric: "Nylon shell, light padded fill", fit: "Regular", closure: "Full zip", neck: "Stand collar" },
    highlights: ["Packs into its own pouch", "Zip hand pockets"],
    tags: ["winter"],
  }),
  S("men-jackets", "Hooded Baffle Puffer", "Deep-baffled insulated puffer with a hood, zip hand pockets and a drawcord hem.", 3999, 4999, [V(["Olive", "#4a4636"], "888558828", "71tAATuRxNL")], {
    badge: "Bestseller",
    details: { fabric: "Nylon shell, insulated fill", fit: "Regular", closure: "Full zip", neck: "Insulated hood" },
    highlights: ["Deep baffles", "Drawcord hem", "Zip hand pockets"],
    tags: ["winter"],
    more: "Made for the coldest weeks of Chillai Kalan, when the snow sits on the road to Gulmarg. Wear it over a hoodie and it keeps the wind out.",
  }),
  S("men-jackets", "Fleece-Lined Zip Jacket", "Heathered stand-collar jacket with a plush fleece lining, zip hand pockets and ribbed cuffs.", 2299, 2999, [V(["Grey", "#666c70"], "888519561", "71B5jt-+AZL")], {
    details: { fabric: "Brushed knit", lining: "Plush fleece", fit: "Regular", closure: "Full zip", neck: "Stand collar" },
    highlights: ["Zip hand pockets", "Ribbed cuffs and hem"],
    tags: ["winter"],
  }),
  S("men-jackets", "3-in-1 Hooded Winter Jacket", "Water-resistant hooded shell with a zip-in inner jacket: wear them together or apart.", 3799, 4799, [V("Charcoal", "888681286", "51ZGE1Ds4vL")], {
    details: { fabric: "Water-resistant shell", lining: "Zip-in inner jacket", fit: "Regular", closure: "Full zip", neck: "Adjustable hood" },
    highlights: ["Zip-in inner jacket", "Zip hand pockets"],
    tags: ["winter", "rain"],
  }),
  S("men-jackets", "Borg-Lined Fleece Jacket", "Black polar fleece with a warm borg lining, a stand collar and zip hand pockets.", 2499, 3199, [V("Black", "888704626", "71PtOvdEmJL")], {
    details: { fabric: "Polar fleece", lining: "Faux-shearling borg", fit: "Regular", closure: "Full zip", neck: "Stand collar" },
    highlights: ["Zip hand pockets"],
    tags: ["winter"],
  }),
  S("men-jackets", "Lightweight Bomber Jacket", "Clean khaki bomber with a ribbed collar, cuffs and hem and a zip chest pocket.", 1999, 2599, [V(["Khaki", "#8f8768"], "745342278", "71-CcbyIZpL")], {
    details: { fabric: "Lightweight woven polyester", fit: "Regular", closure: "Full zip", neck: "Ribbed collar" },
    highlights: ["Ribbed collar, cuffs and hem", "Zip chest pocket"],
    tags: ["autumn"],
  }),
  S("men-jackets", "Hooded Outdoor Windbreaker", "Light hooded windbreaker with a zip chest pocket, for wet walks and windy days.", 2199, 2799, [V(["Olive", "#434a40"], "745316585", "51ZlFMQeThL")], {
    details: { fabric: "Water-resistant polyester", fit: "Regular", closure: "Full zip", neck: "Hood" },
    highlights: ["Zip chest pocket", "Hand pockets"],
    tags: ["rain"],
  }),
  S("men-jackets", "Wool-Blend Overcoat", "Single-breasted, knee-length overcoat with a quilted inner bib and flap pockets.", 4499, 5999, [V(["Black", "#2a2a2e"], "745315842", "51xu+nO2lYL")], {
    badge: "New",
    details: { fabric: "Wool blend", lining: "Quilted", fit: "Regular", closure: "Button front", neck: "Notch collar", length: "Knee length", washCare: WASH_COAT },
    highlights: ["Quilted inner bib", "Flap pockets"],
    tags: ["winter"],
    more: "For weddings, office days and cold evenings in the market. It sits well over a sweater and a collared shirt.",
  }),
  // Men · sweatshirts & hoodies
  S("men-sweatshirts", "Cable-Texture Raglan Hoodie", "Cable-textured hoodie with contrast olive raglan sleeves and hood, and white drawcords.", 1799, 2299, [V(["Sand", "#d3bfa8"], "888436866", "71D0fioXLFL")], {
    details: { fabric: "Cable-texture knit", fit: "Regular", sleeve: "Full raglan", neck: "Drawcord hood" },
    highlights: ["Olive sleeves and hood"],
    tags: ["winter"],
  }),
  S("men-sweatshirts", "Colour-Block Pullover Hoodie", "Heathered blue hoodie with black sleeves and trim and a kangaroo pocket.", 1599, 1999, [V(["Blue", "#4d6891"], "888455640", "71bXGDe22WL")], {
    details: { fabric: "Heathered fleece", fit: "Regular", sleeve: "Full", neck: "Drawcord hood" },
    highlights: ["Black sleeves, hood trim and hem", "Kangaroo pocket"],
    tags: ["winter"],
  }),
  S("men-sweatshirts", "Classic Crew Sweatshirt", "A plain crewneck in soft fleece, with ribbed cuffs and hem.", 1299, 1699, [V(["Pink", "#d6b4a4"], "818324467", "813jGbNnNcL")], {
    details: { fabric: "Cotton-blend fleece", fit: "Relaxed", sleeve: "Full", neck: "Crew" },
    highlights: ["Ribbed collar, cuffs and hem"],
  }),
  S("men-sweatshirts", "Polar Fleece Zip Hoodie", "Soft polar fleece zip hoodie with patch hand pockets.", 1899, 2399, [V(["Navy", "#23406b"], "595284650", "71SvcVLgptL")], {
    badge: "Bestseller",
    details: { fabric: "Polar fleece", fit: "Regular", sleeve: "Full", neck: "Hood", closure: "Full zip" },
    highlights: ["Patch hand pockets"],
    tags: ["winter"],
  }),
  S("men-sweatshirts", "Brushed Fleece Crewneck", "Relaxed crewneck, brushed soft on the inside.", 1299, 1699, [V(["Cream", "#ece0c4"], "888835831", "51Jt-4Mt+eL")], {
    details: { fabric: "Brushed-back fleece", fit: "Relaxed", sleeve: "Full", neck: "Crew" },
  }),
  S("men-sweatshirts", "Chevron Colour-Block Hoodie", "Fleece hoodie in orange, grey and navy chevron panels, with a kangaroo pocket.", 1699, 2199, [V(["Multicolour", "#e8733a"], "888436864", "71TZQTXvhPL")], {
    badge: "New",
    details: { fabric: "Fleece", fit: "Regular", sleeve: "Full", neck: "Drawcord hood", pattern: "Orange, grey and navy panels" },
    highlights: ["Kangaroo pocket"],
    tags: ["winter"],
  }),
  S("men-sweatshirts", "Raglan Zip Hoodie", "Sky-blue fleece zip hoodie with raglan sleeves and kangaroo pockets.", 1799, 2299, [V(["Sky blue", "#8fb2c8"], "888704314", "61oP+L8Z1iL")], {
    details: { fabric: "Cotton-blend fleece", fit: "Regular", sleeve: "Full raglan", neck: "Drawcord hood", closure: "Full zip" },
    highlights: ["Kangaroo pockets", "Ribbed cuffs and hem"],
  }),
  S("men-sweatshirts", "Quarter-Zip Utility Hoodie", "Heavy fleece hoodie with a quarter zip, a snap-flap chest pocket and a sleeve badge.", 1999, 2499, [V(["Slate", "#6f8193"], "888759557", "61WSp9VtU1L")], {
    details: { fabric: "Heavy fleece", fit: "Regular", sleeve: "Full", neck: "Hood", closure: "Quarter zip" },
    highlights: ["Snap-flap chest pocket"],
    tags: ["winter"],
  }),
  S("men-sweatshirts", "Microfleece Half-Zip", "Light microfleece pullover with a half zip and a stand collar.", 1499, 1899, [V(["Cream", "#ebe4da"], "888538111", "51Db7DV4ksL")], {
    details: { fabric: "Microfleece", fit: "Regular", sleeve: "Full", neck: "Stand collar", closure: "Half zip" },
    tags: ["winter"],
  }),
  S("men-sweatshirts", "Waffle-Knit Zip Hoodie", "Slim, lightweight zip hoodie in a white cotton waffle knit.", 1499, 1999, [V("White", "745316138", "61HiuAGKBqL")], {
    details: { fabric: "Cotton waffle knit", fit: "Slim", sleeve: "Full", neck: "Drawcord hood", closure: "Full zip" },
    highlights: ["Kangaroo pockets"],
  }),
  S("men-sweatshirts", "Fleece-Lined Zip Hoodie", "Mint zip hoodie with a plush fleece lining and kangaroo pockets.", 1799, 2299, [V(["Mint", "#8fc4b6"], "888583519", "713Sga6EVwL")], {
    details: { fabric: "Cotton blend", lining: "Plush fleece", fit: "Regular", sleeve: "Full", neck: "Hood", closure: "Full zip" },
    highlights: ["Kangaroo pockets"],
    tags: ["winter"],
  }),
  S("men-sweatshirts", "Quarter-Zip Training Top", "Close-fitting quarter-zip in a stretch knit, for runs and cold-morning layering.", 1299, 1699, [V(["Black", "#27282a"], "888744779", "61Bsc7W4eOL")], {
    details: { fabric: "Stretch performance knit", fit: "Slim", sleeve: "Full", neck: "Stand collar", closure: "Quarter zip" },
    highlights: ["Raglan seams"],
  }),
  S("men-sweatshirts", "Knit Zip Hoodie", "Fine-gauge knit zip hoodie in camel, with a contrast orange zip trim.", 2499, 3199, [V(["Tan", "#a88d72"], "888513698", "71mStixgHtL")], {
    details: { fabric: "Fine-gauge knit", fit: "Regular", sleeve: "Full", neck: "Hood", closure: "Full zip" },
    highlights: ["Contrast zip trim", "Hand pockets"],
    tags: ["winter"],
  }),
  // Men · t-shirts
  S("men-t-shirts", "Slub Henley Tee", "Short-sleeve henley in a soft slub jersey, with a three-button placket.", 699, 999, [V(["Sand", "#c0a577"], "888495755", "618SJoElpnL")], {
    details: { fabric: "Slub cotton-blend jersey", fit: "Regular", sleeve: "Half", neck: "Three-button henley" },
  }),
  S("men-t-shirts", "Classic Crew Tee", "The everyday crew tee in soft cotton jersey.", 499, 699, [V(["Maroon", "#6a1628"], "888713772", "61p-v+Y5qtL")], {
    badge: "Bestseller",
    details: { fabric: "Cotton jersey", fit: "Regular", sleeve: "Half", neck: "Crew" },
  }),
  S("men-t-shirts", "Long-Sleeve V-Neck Tee", "Slim long-sleeve V-neck in a stretch cotton jersey.", 799, 1099, [V(["Navy", "#171834"], "888575291", "51VUi5GrUQL")], {
    details: { fabric: "Stretch cotton jersey", fit: "Slim", sleeve: "Full", neck: "V-neck" },
  }),
  S("men-t-shirts", "Two-Tone Raglan Tee", "Long-sleeve raglan tee with contrast tan sleeves and collar and a V-stitch at the neck.", 899, 1199, [V(["Black", "#262422"], "888696353", "617881Vpl8L")], {
    details: { fabric: "Cotton-blend jersey", fit: "Regular", sleeve: "Full raglan", neck: "Crew" },
    highlights: ["Tan sleeves and collar", "V-stitch at the neck"],
  }),
  S("men-t-shirts", "Everyday V-Neck Tee", "A clean short-sleeve V-neck in soft cotton jersey.", 549, 799, [V(["Navy", "#2f3146"], "888494899", "71ise2x+dpL")], {
    details: { fabric: "Cotton jersey", fit: "Regular", sleeve: "Half", neck: "V-neck" },
  }),
  S("men-t-shirts", "Combed Cotton Crew Tee", "Bright crew tee in combed cotton that keeps its shape wash after wash.", 549, 799, [V(["Red", "#d93a32"], "888837938", "71npfziAdoL")], {
    details: { fabric: "Combed cotton", fit: "Regular", sleeve: "Half", neck: "Crew" },
  }),
  S("men-t-shirts", "Long-Sleeve Slub Henley", "Black long-sleeve henley in slub jersey, with a button placket and a curved hem.", 899, 1199, [V("Black", "745312305", "61YNS6SRxnL")], {
    badge: "New",
    details: { fabric: "Slub cotton jersey", fit: "Regular", sleeve: "Full", neck: "Button henley" },
    highlights: ["Curved hem"],
  }),
  S("men-t-shirts", "Soft Crew Tee", "Sky-blue crew tee in a soft, light cotton jersey.", 499, 699, [V(["Sky blue", "#63a8cc"], "888682509", "71+pTV0f4QL")], {
    details: { fabric: "Soft cotton jersey", fit: "Regular", sleeve: "Half", neck: "Crew" },
  }),
  S("men-t-shirts", "Notch-Neck Tee", "Slim white tee with a notch neck and layered sleeve hems.", 599, 899, [V("White", "888801540", "61QJpZvWYqL")], {
    details: { fabric: "Stretch cotton jersey", fit: "Slim", sleeve: "Half", neck: "Notch neck" },
    highlights: ["Layered sleeve hems"],
  }),
  S("men-t-shirts", "Essential Crew Tee", "A plain black crew tee, the one that goes with everything.", 449, 699, [V("Black", "818319212", "61MibdBb-5L")], {
    details: { fabric: "Cotton jersey", fit: "Regular", sleeve: "Half", neck: "Crew" },
  }),
  S("men-t-shirts", "Band-Collar Henley Tee", "Short-sleeve tee with a band collar and a button placket.", 749, 999, [V(["Cream", "#d6c6b6"], "888828732", "51gXLI-HUcL")], {
    details: { fabric: "Cotton blend", fit: "Slim", sleeve: "Half", neck: "Band collar, button placket" },
  }),
  S("men-t-shirts", "Lightweight Crew Tee", "Light cotton crew tee in a brick red, for warm afternoons.", 499, 699, [V(["Red", "#c0353a"], "595254131", "71swe-9z-2L")], {
    details: { fabric: "Lightweight cotton", fit: "Regular", sleeve: "Half", neck: "Crew" },
  }),
  // Men · vests & base layers
  S("men-vests", "Everyday Vest, Pack of 3", "Three soft scoop-neck vests in black, white and blue.", 699, 999, [V(["Multicolour", "#5a76a6"], "888668901", "61e+LLevzZL")], {
    details: { fabric: "Soft stretch jersey", fit: "Regular", sleeve: "Sleeveless", neck: "Scoop" },
    highlights: ["Black, white and blue in each pack"],
  }),
  S("men-vests", "Ribbed Vest, Pack of 3", "Three fitted ribbed vests in black, grey and white.", 599, 899, [V(["Multicolour", "#8a8a8a"], "818285604", "71q1MtqgeVL")], {
    badge: "Bestseller",
    details: { fabric: "Ribbed cotton with stretch", fit: "Fitted", sleeve: "Sleeveless", neck: "Scoop" },
    highlights: ["Black, grey and white in each pack"],
  }),
  S("men-vests", "Cotton Vest, Pack of 6", "Six black cotton vests with a round neck.", 899, 1299, [V("Black", "888728569", "61n9ut2dzZL")], {
    details: { fabric: "100% cotton", fit: "Regular", sleeve: "Sleeveless", neck: "Round" },
    highlights: ["Six vests in each pack"],
  }),
  S("men-vests", "Mock-Neck Base Layer", "Close-fitting long-sleeve base layer with a mock neck and flatlock seams.", 799, 1099, [V(["Mint", "#6fa596"], "888517621", "71rirLB0LEL", "61+dR7WYFxL")], {
    details: { fabric: "Stretch performance knit", fit: "Close fitting", sleeve: "Full raglan", neck: "Mock neck" },
    tags: ["winter"],
    more: "A first layer under a shirt or sweatshirt on cold mornings. Thin enough not to add bulk.",
  }),
  S("men-vests", "Long-Sleeve Base Layer, Pack of 2", "Two close-fitting long-sleeve base layers, one white and one navy.", 999, 1399, [V(["Multicolour", "#2a2f4a"], "888847749", "61H7auUrgUL")], {
    details: { fabric: "Stretch performance knit", fit: "Close fitting", sleeve: "Full raglan", neck: "Crew" },
    highlights: ["One white, one navy"],
    tags: ["winter"],
  }),
  S("men-vests", "Racer-Back Gym Vest", "Mustard cotton gym vest with a racer back and contrast binding.", 449, 699, [V(["Mustard", "#e39a12"], "818299073", "61T2gwzuCjL")], {
    details: { fabric: "100% cotton", fit: "Regular", sleeve: "Sleeveless", neck: "Scoop, racer back" },
    highlights: ["Black and white binding"],
  }),
  // Women · jackets
  S("women-jackets", "Teddy Fleece Button Coat", "Fluffy hooded teddy-fleece coat with a button front and a curved high-low hem.", 2499, 3199, [V(["Black", "#1c1c1c"], "595279966", "71QcD+ByftL")], {
    details: { fabric: "Teddy fleece", fit: "Relaxed", closure: "Buttons", neck: "Hood" },
    highlights: ["High-low hem", "Button detail at the hem"],
    tags: ["winter"],
  }),
  S("women-jackets", "Longline Puffer Coat", "Knee-length puffer with a high collar, a snap front and a silver-grey lining.", 4499, 5799, [V(["Navy", "#34405a"], "445316410", "51FvS+wpSWL")], {
    badge: "Bestseller",
    details: { fabric: "Glossy nylon shell, padded fill", lining: "Silver-grey", fit: "Regular", closure: "Snap front", neck: "High collar", length: "Knee length" },
    tags: ["winter"],
    more: "Long enough to keep the wind off in Chillai Kalan, light enough for the walk to college or the market.",
  }),
  S("women-jackets", "Lightweight Windbreaker", "Apricot windbreaker with a stand collar, a zip chest pocket and reflective piping.", 1999, 2599, [V(["Orange", "#f7a24f"], "818292383", "51AUwFN54qL")], {
    details: { fabric: "Lightweight polyester", fit: "Regular", closure: "Full zip", neck: "Stand collar" },
    highlights: ["Zip chest pocket", "Reflective piping"],
    tags: ["rain"],
  }),
  S("women-jackets", "Hooded Rain Shell", "Light, packable rain shell with an adjustable hood and a full zip.", 2499, 3199, [V(["Rust", "#b8452e"], "888712409", "814hVhWzinL")], {
    details: { fabric: "Lightweight waterproof shell", fit: "Regular", closure: "Full zip", neck: "Adjustable hood" },
    tags: ["rain"],
  }),
  S("women-jackets", "Asymmetric Zip Hooded Coat", "Fitted hooded coat with an asymmetric ring zip, a drawcord waist and a flared hem.", 2299, 2999, [V(["Navy", "#1c2433"], "595299600", "51VXzT25aIL")], {
    details: { fabric: "Soft cotton blend", fit: "Fitted, flared hem", closure: "Asymmetric ring zip", neck: "Hood" },
    highlights: ["Drawcord waist", "Contrast drawcords"],
    tags: ["autumn"],
  }),
  S("women-jackets", "Striped-Hood Rain Jacket", "Hooded rain jacket with a striped hood lining, a zip and snap placket and flap pockets.", 2199, 2799, [V(["Maroon", "#5c1a2f"], "745328229", "61FWvtGhTgL")], {
    badge: "New",
    details: { fabric: "Water-resistant polyester", fit: "Regular", closure: "Zip and snap placket", neck: "Hood with striped lining" },
    highlights: ["Two flap pockets", "Drawcord hood"],
    tags: ["rain"],
  }),
  S("women-jackets", "3-in-1 Hooded Jacket", "White and pink hooded shell with a zip-in fleece jacket inside.", 3999, 4999, [V(["White", "#ece9e9"], "888681365", "61B8hfldX5L")], {
    details: { fabric: "Water-resistant shell", lining: "Zip-in fleece jacket", fit: "Regular", closure: "Full zip", neck: "Hood" },
    highlights: ["Pink side panels", "Zip sleeve pocket"],
    tags: ["winter", "rain"],
  }),
  S("women-jackets", "Fleece-Lined Snow Jacket", "Warm hooded snow jacket with a fleece lining and zip pockets.", 3499, 4499, [V("Black", "595297749", "71v6QxfT-cL")], {
    details: { fabric: "Waterproof shell", lining: "Fleece", fit: "Regular", closure: "Full zip", neck: "Hood" },
    highlights: ["Zip chest pockets"],
    tags: ["winter"],
  }),
  S("women-jackets", "Fur-Trim Hooded Parka", "Mid-length parka with a faux-fur trimmed hood and a plush, warm lining.", 3999, 4999, [V(["Black", "#1e1e1e"], "595260468", "51rZwGcUqKL")], {
    badge: "Bestseller",
    details: { fabric: "Cotton-blend shell", lining: "Plush faux fur", fit: "Regular", closure: "Zip front", neck: "Faux-fur trimmed hood", length: "Mid thigh" },
    tags: ["winter"],
  }),
  S("women-jackets", "Longline Softshell Jacket", "Longer-length hooded softshell with a zip chest pocket.", 2999, 3799, [V(["Pink", "#e3a3a3"], "888782443", "71bmGeIlduL")], {
    details: { fabric: "Softshell", fit: "Regular", closure: "Full zip", neck: "Hood", length: "Hip length" },
    highlights: ["Zip chest pocket"],
    tags: ["rain"],
  }),
  S("women-jackets", "Belted Trench Coat", "Double-breasted red trench with a tie belt and buckled cuff straps.", 3499, 4499, [V(["Red", "#a3171d"], "888767419", "61J98v0JLvL")], {
    badge: "New",
    details: { fabric: "Woven polyester", fit: "Belted", closure: "Double-breasted buttons", neck: "Notch collar", length: "Below the knee", washCare: WASH_COAT },
    highlights: ["Tie belt", "Buckled cuff straps"],
    tags: ["autumn"],
  }),
  S("women-jackets", "Polar Fleece Jacket", "Soft sage polar fleece with a stand collar and a full zip.", 1799, 2299, [V(["Sage", "#b3bdb0"], "888528918", "51k1fetCxlL")], {
    details: { fabric: "Polar fleece", fit: "Relaxed", closure: "Full zip", neck: "Stand collar" },
    tags: ["winter"],
  }),
  // Women · sweatshirts & hoodies
  S("women-sweatshirts", "Terry Zip-Up Sweatshirt", "Cream French-terry zip-up with a ribbed collar, cuffs and hem.", 1799, 2299, [V(["Cream", "#ebe5d6"], "888588698", "61FnPaBK5+L")], {
    details: { fabric: "French terry", fit: "Regular", sleeve: "Full", neck: "Ribbed collar", closure: "Full zip" },
  }),
  S("women-sweatshirts", "Stripe-Band Crew Sweatshirt", "Navy raglan crewneck with a band of warm stripes across the chest.", 1499, 1899, [V(["Navy", "#23284a"], "888439750", "61EtvYtdyfL")], {
    details: { fabric: "French terry", fit: "Regular", sleeve: "Full raglan", neck: "Crew", pattern: "Stripe band" },
  }),
  S("women-sweatshirts", "Funnel-Neck Sweatshirt", "Oversized sky-blue sweatshirt with a tall funnel neck.", 1599, 1999, [V(["Sky blue", "#bfd6ee"], "888688812", "61ipRbvdSKL")], {
    details: { fabric: "Brushed fleece", fit: "Oversized", sleeve: "Full, dropped shoulder", neck: "Funnel neck" },
    tags: ["winter"],
  }),
  S("women-sweatshirts", "Striped Zip Hoodie", "Plum and black striped zip hoodie with kangaroo pockets.", 1699, 2199, [V(["Purple", "#4a2f4c"], "888728048", "719fvf84g1L")], {
    details: { fabric: "Striped knit fleece", fit: "Regular", sleeve: "Full", neck: "Drawcord hood", closure: "Full zip", pattern: "Plum and black stripes" },
    highlights: ["Kangaroo pockets"],
  }),
  S("women-sweatshirts", "Mock-Neck Oversized Sweatshirt", "Roomy white sweatshirt with a mock neck and dropped shoulders.", 1399, 1799, [V("White", "745326100", "41MedXH0NFL")], {
    details: { fabric: "Brushed fleece", fit: "Oversized", sleeve: "Full, dropped shoulder", neck: "Mock neck" },
  }),
  S("women-sweatshirts", "Oversized Zip Hoodie", "Bright red oversized zip hoodie with a kangaroo pocket.", 1699, 2199, [V(["Red", "#b0000a"], "745303892", "61kYl4Wq3cL", "51VS0vjN2+L")], {
    badge: "Bestseller",
    details: { fabric: "Fleece", fit: "Oversized", sleeve: "Full, dropped shoulder", neck: "Drawcord hood", closure: "Full zip" },
    highlights: ["Kangaroo pocket"],
    tags: ["winter"],
  }),
  S("women-sweatshirts", "Classic Pullover Hoodie", "Plain pullover hoodie with white drawcords and a kangaroo pocket.", 1499, 1899, [V(["Maroon", "#4c1f2c"], "745326099", "51sTSfwMxBL", "51e6fzm9uzL")], {
    details: { fabric: "Fleece", fit: "Regular", sleeve: "Full raglan", neck: "Drawcord hood" },
    highlights: ["Kangaroo pocket", "White drawcords"],
    tags: ["winter"],
  }),
  S("women-sweatshirts", "Balloon-Sleeve Sweatshirt", "Black high-neck sweatshirt with full balloon sleeves gathered into ribbed cuffs.", 1599, 1999, [V("Black", "888639471", "51Rz+Ihk1+L")], {
    badge: "New",
    details: { fabric: "Soft jersey", fit: "Relaxed", sleeve: "Balloon, ribbed cuffs", neck: "High crew" },
  }),
  S("women-sweatshirts", "Grid-Fleece Half-Zip", "Fitted half-zip in a light grid fleece, with shoulder overlays and a curved back hem.", 1999, 2599, [
    V(["Coral", "#dc3a45"], "445317427", "81JObqLnC3L", "811oaoXyUWL"),
    V("White", "445317449", "81RstMmyBYL", "71SFk1RKm+L"),
    V(["Teal", "#067a96"], "445317412", "71NaO173FKL"),
  ], {
    details: { fabric: "Grid fleece", fit: "Fitted", sleeve: "Full", neck: "Stand collar", closure: "Half zip" },
    highlights: ["Shoulder overlays", "Curved back hem"],
    tags: ["winter"],
  }),
  S("women-sweatshirts", "Campus Zip Hoodie", "Relaxed, washed-fleece zip hoodie in a bright pink.", 1799, 2299, [V(["Pink", "#f47ac8"], "888646252", "81dZuMo8XXL")], {
    details: { fabric: "Washed fleece", fit: "Relaxed", sleeve: "Full", neck: "Lined hood", closure: "Full zip" },
    highlights: ["Kangaroo pockets"],
  }),
  S("women-sweatshirts", "Everyday Oversized Zip Hoodie", "Longer-length oversized zip hoodie in soft mint fleece.", 1599, 1999, [V(["Mint", "#97bba6"], "888583509", "61OXEv8sSyL")], {
    details: { fabric: "Fleece", fit: "Oversized", sleeve: "Full, dropped shoulder", neck: "Drawcord hood", closure: "Full zip", length: "Hip length" },
    highlights: ["Kangaroo pockets"],
  }),
  S("women-sweatshirts", "Printed Borg-Lined Hoodie", "Relaxed hoodie in an all-over geometric print, with a warm borg-lined hood.", 1899, 2399, [V(["Multicolour", "#6aa7c9"], "445300974", "71AHD41lc9L")], {
    details: { fabric: "Printed fleece", lining: "Faux-shearling borg hood", fit: "Relaxed", sleeve: "Full", neck: "Hood", pattern: "Geometric print" },
    tags: ["winter"],
  }),
  // Women · tops
  S("women-tops", "Embroidered Linen Top", "Short-sleeve cotton-linen top with bright folk embroidery down the front and on the sleeves.", 899, 1299, [V(["Mustard", "#d2b06e"], "888611902", "61PuU9BGH0L")], {
    badge: "Bestseller",
    details: { fabric: "Cotton-linen blend", fit: "Relaxed", sleeve: "Half", neck: "Round", washCare: WASH_LINEN },
    highlights: ["Colourful embroidery", "Contrast piping", "High-low hem"],
  }),
  S("women-tops", "Tonal Embroidered Peasant Top", "Lilac cotton-linen top with tonal embroidery and gathered three-quarter sleeves.", 999, 1399, [V(["Lavender", "#9a86a0"], "888651589", "71YoQobbhjL")], {
    details: { fabric: "Cotton-linen blend", fit: "Relaxed", sleeve: "Three-quarter, gathered", neck: "Round", washCare: WASH_LINEN },
    highlights: ["Tonal embroidery down the front"],
  }),
  S("women-tops", "Bell-Sleeve Blouse", "Butter-yellow blouse with fluted bell sleeves and a cross-back keyhole neckline.", 899, 1199, [V(["Yellow", "#f2d9a8"], "445307334", "81FAzzJJdUL")], {
    details: { fabric: "Textured woven", fit: "Regular", sleeve: "Full, bell cuffs", neck: "Round, keyhole back" },
  }),
  S("women-tops", "Long-Sleeve Crew Top", "Fitted long-sleeve crew top in a stretch cotton jersey, easy to layer.", 599, 899, [V(["Teal", "#2fbfae"], "745315271", "51K5NbMamIL")], {
    details: { fabric: "Stretch cotton jersey", fit: "Fitted", sleeve: "Full", neck: "Crew" },
  }),
  S("women-tops", "Roll-Tab Tunic Top", "Black V-neck tunic with roll-tab sleeves, a front pleat and a curved hem.", 1099, 1499, [V("Black", "445320592", "51zA1MZcKmL")], {
    details: { fabric: "Soft woven", fit: "Relaxed", sleeve: "Three-quarter, roll-tab", neck: "V-neck", length: "Tunic" },
    highlights: ["Front pleat", "Curved hem"],
  }),
  S("women-tops", "Embroidered Cotton-Linen Blouse", "Short-sleeve cotton-linen blouse with tonal embroidery and a scoop neck.", 999, 1399, [V(["Teal", "#3a6979"], "888611917", "61vWZcIMP7L")], {
    details: { fabric: "Cotton-linen blend", fit: "Relaxed", sleeve: "Half", neck: "Scoop", washCare: WASH_LINEN },
    highlights: ["Tonal embroidery", "Curved hem"],
  }),
  S("women-tops", "Keyhole Blouse", "Soft long-sleeve blouse with a keyhole front and buttoned cuffs.", 1099, 1499, [V(["Sky blue", "#a3b8d6"], "888545831", "71DxzhIDaDL")], {
    badge: "New",
    details: { fabric: "Soft woven", fit: "Regular", sleeve: "Full, buttoned cuffs", neck: "Round, keyhole front" },
  }),
  S("women-tops", "V-Neck Flare Tunic", "Three-quarter-sleeve V-neck tunic that flares from the bust, in plain maroon or a warm print.", 1199, 1599, [
    V(["Maroon", "#5a0a18"], "888443496", "514bYaWvlwL"),
    V(["Multicolour", "#d9763f"], "888523198", "81U4A2MPNIL"),
  ], {
    details: { fabric: "Stretch jersey", fit: "Flared", sleeve: "Three-quarter", neck: "V-neck", length: "Tunic" },
  }),
  S("women-tops", "Button-Detail Embroidered Top", "Cotton-linen top with floral embroidery, a row of buttons and rolled sleeves.", 999, 1399, [
    V(["Charcoal", "#555453"], "888611905", "61wEK4GUGUL"),
    V(["Mustard", "#c3993e"], "888611910", "61ymQ5BUdCL"),
  ], {
    details: { fabric: "Cotton-linen blend", fit: "Relaxed", sleeve: "Half, rolled", neck: "Round", washCare: WASH_LINEN },
    highlights: ["Floral embroidery", "Decorative buttons"],
  }),
  S("women-tops", "Dandelion Print Linen Top", "Khaki cotton-linen top with a dandelion print and a side-button neckline.", 899, 1199, [V(["Khaki", "#9b8445"], "445334162", "61n32D3ZG1L")], {
    details: { fabric: "Cotton-linen blend", fit: "Relaxed", sleeve: "Three-quarter, rolled", neck: "Round, side buttons", washCare: WASH_LINEN },
    highlights: ["Dandelion print"],
  }),
  S("women-tops", "Embroidered Linen Tunic Top", "Petrol-blue cotton-linen top with tonal embroidery and a buttoned V-neck.", 1099, 1499, [V(["Blue", "#284c68"], "888693759", "71JsSCdG28L")], {
    details: { fabric: "Cotton-linen blend", fit: "Relaxed", sleeve: "Three-quarter", neck: "Buttoned V-neck", washCare: WASH_LINEN },
    highlights: ["Tonal embroidery", "Uneven hem"],
  }),
  // Accessories · travel bags and luggage (added alongside the Magento bags)
  S("accessories-bags", "Hard-Shell Spinner Trolley, 24 in", "Medium hard-shell trolley on four spinner wheels, with a telescopic handle.", 3999, 5499, [V(["Navy", "#243565"], "595262038", "81WUXuajEmL")], {
    badge: "Bestseller",
    details: { fabric: "Hard shell", closure: "Zip", dimensions: "66 × 44 × 27 cm" },
    highlights: ["Four spinner wheels", "Telescopic handle", "Side carry handle"],
    tags: ["travel"],
  }),
  S("accessories-bags", "Large Hard-Shell Trolley, 28 in", "Large checked-in trolley with a ribbed hard shell and double spinner wheels.", 4999, 6499, [V("Black", "595261728", "81ML4mASQfL")], {
    details: { fabric: "Hard shell", closure: "Zip", dimensions: "76 × 51 × 30 cm" },
    highlights: ["Four double spinner wheels", "Telescopic handle"],
    tags: ["travel"],
  }),
  S("accessories-bags", "Front-Opening Trolley, Medium", "Silver ribbed trolley with a front lid that opens without laying the case flat.", 5499, 6999, [V("Silver", "888593762", "6162hj3jVjL")], {
    badge: "New",
    details: { fabric: "Hard shell", closure: "Zip", dimensions: "68 × 45 × 26 cm" },
    highlights: ["Front-opening lid", "Four spinner wheels"],
    tags: ["travel"],
  }),
  S("accessories-bags", "Three-Piece Trolley Set", "Cabin, medium and large hard-shell trolleys that nest inside each other for storage.", 8999, 11999, [V(["Black", "#3a3b40"], "445338341", "71LGF2UlzDL")], {
    details: { fabric: "Hard shell", closure: "Zip", dimensions: "Cabin 55 cm, medium 65 cm, large 75 cm tall" },
    highlights: ["Three sizes", "Four spinner wheels on each"],
    tags: ["travel"],
    more: "One set for every trip: the cabin case for a weekend in Srinagar, the large one for the family trip to Delhi.",
  }),
  S("accessories-bags", "Aluminium-Frame Trolley", "Rose-pink ribbed trolley with an aluminium frame and two clip locks instead of a zip.", 6499, 7999, [V(["Pink", "#dcb8b5"], "888659040", "614NQHRFWpL")], {
    details: { fabric: "Hard shell, aluminium frame", closure: "Clip locks", dimensions: "68 × 44 × 27 cm" },
    highlights: ["Aluminium frame", "Four spinner wheels"],
    tags: ["travel"],
  }),
  S("accessories-bags", "Soft Cabin Trolley", "Soft-sided underseat trolley with a zip front pocket and four spinner wheels.", 2999, 3899, [V(["Grey", "#6f706c"], "888651379", "71AJpG7ZaVL")], {
    details: { fabric: "Polyester", closure: "Zip", dimensions: "43 × 33 × 20 cm" },
    highlights: ["Fits under an aircraft seat", "Zip front pocket"],
    tags: ["travel"],
  }),
  S("accessories-bags", "Two-Wheel Duffle Trolley", "Roomy duffle with wheels at the back, long carry handles and a zip end pocket.", 1999, 2599, [V(["Brown", "#7b6656"], "445348702", "71UWZSyN8oL", "81P9H3TdLqL")], {
    details: { fabric: "Textured polyester", closure: "Zip", dimensions: "55 × 32 × 30 cm" },
    highlights: ["Two wheels", "Long carry handles"],
    tags: ["travel"],
  }),
  S("accessories-bags", "Expandable Canvas Holdall", "Large black canvas holdall with tan trim, zip end pockets and a shoulder strap.", 2499, 3199, [V(["Black", "#2e2a2a"], "888592635", "71fDO2ziUHL")], {
    details: { fabric: "Canvas with leather-look trim", closure: "Zip", dimensions: "55 × 30 × 30 cm" },
    highlights: ["Zip end pockets", "Detachable shoulder strap"],
    tags: ["travel"],
  }),
  S("accessories-bags", "Leather-Look Gym Duffle", "Tan leather-look barrel duffle with brown webbing handles and a shoulder strap.", 1299, 1699, [V(["Tan", "#9a4b2f"], "888501192", "71e+OoO3IeL")], {
    details: { fabric: "Leather-look PU", closure: "Zip", dimensions: "45 × 25 × 25 cm" },
    highlights: ["Adjustable shoulder strap"],
    tags: ["travel"],
  }),
  S("accessories-bags", "Weekender Holdall", "Black weekender with leather-look handles and a reinforced base.", 1999, 2599, [V(["Black", "#2d2b31"], "445309269", "81Q01HLokoL")], {
    details: { fabric: "Polyester, leather-look handles", closure: "Zip", dimensions: "55 × 30 × 28 cm" },
    highlights: ["Detachable shoulder strap", "Reinforced base"],
    tags: ["travel"],
  }),
  // Accessories · caps & beanies
  BEANIE("Cuffed Knit Beanie", "The classic cuffed beanie in a fine rib knit.", 399, 599, [V(["Red", "#c80b19"], "888588537", "71vF0ZppfvL")], {
    badge: "Bestseller",
    details: { fabric: "Acrylic knit" },
  }),
  BEANIE("Fleece-Lined Knit Beanie", "Heathered knit beanie with a soft fleece lining and a leather-look patch.", 499, 699, [V(["Olive", "#343a26"], "888588452", "81YcM4Laq8L")], {
    details: { fabric: "Acrylic knit", lining: "Fleece" },
  }),
  BEANIE("Rib-Knit Fisherman Beanie", "Short, cuffless fisherman beanie in a deep rib knit.", 449, 649, [V(["Tan", "#8a6140"], "818285567", "81akGM+MWLL"), V(["Navy", "#1d2a45"], "818285291", "71qU8w2ywwL")], {
    details: { fabric: "Wool-blend knit" },
  }),
  BEANIE("Striped Pom-Pom Beanie", "Olive cuffed beanie with mustard stripes and a matching pom-pom.", 499, 699, [V(["Olive", "#4a5a1f"], "888670577", "81ICokUwCtL")], {
    badge: "New",
    details: { fabric: "Acrylic knit" },
  }),
  BEANIE("Knit Visor Beanie", "Slouchy black knit beanie with a short knit peak.", 599, 799, [V("Black", "818285779", "61g650wUIBL")], {
    details: { fabric: "Wool-blend knit" },
    highlights: ["Knit peak"],
  }),
  BEANIE("Faux-Fur Trapper Hat", "Water-resistant trapper hat with faux-fur ear flaps and a chin strap.", 899, 1199, [V(["Brown", "#5a4a3c"], "595291503", "71xArNbRYTL")], {
    badge: "New",
    details: { fabric: "Water-resistant shell", lining: "Faux fur", washCare: WASH_SPOT },
    highlights: ["Fold-down ear flaps", "Chin strap"],
  }),
  BEANIE("Chunky Rib Beanie", "Chunky rib-knit beanie with a deep cuff and a soft fleece lining.", 549, 799, [V(["Maroon", "#4d1d27"], "818285527", "814ouC4cMbL")], {
    details: { fabric: "Chunky rib knit", lining: "Fleece" },
  }),
  BEANIE("Cotton Skull Cap", "Thin, cuffless cotton skull cap that fits under a hood.", 349, 499, [V(["Charcoal", "#343436"], "888700198", "91LWd2n4I3L")], {
    details: { fabric: "100% cotton knit", washCare: WASH },
  }),
  BEANIE("Slouchy Cable-Knit Beanie", "Relaxed, slouchy beanie in a textured cable knit.", 499, 699, [V(["Red", "#980d1c"], "595269000", "61gLi-qBIWL"), V(["Black", "#2a2b2f"], "595268995", "61kKFrSWCrL")], {
    badge: "Bestseller",
    details: { fabric: "Acrylic knit" },
  }),
  BEANIE("Marled Cuff Beanie", "Black and grey marled knit beanie with a deep cuff and a fleece lining.", 449, 649, [V(["Charcoal", "#3c4048"], "818286779", "81ngZmezsrL")], {
    details: { fabric: "Marled knit", lining: "Fleece" },
  }),
  BEANIE("Striped Slouch Beanie", "Light, slouchy beanie in navy and grey stripes.", 399, 599, [V(["Navy", "#3d3f55"], "888694595", "81j8k4Y2tlL")], {
    details: { fabric: "Soft cotton-blend knit" },
  }),
  BEANIE("Borg Trapper Cap", "Quilted cream trapper cap with warm borg ear flaps and an adjustable chin strap.", 799, 999, [V(["Cream", "#e9e5dd"], "745342650", "61ciGu6b+nL")], {
    details: { fabric: "Quilted shell", lining: "Faux-shearling borg", washCare: WASH_SPOT },
    highlights: ["Ear flaps", "Adjustable chin strap"],
  }),
];

// ── Copy templates per category (rotated; a product's `more` replaces it) ────
export const DESCRIPTIONS = {
  "men-jackets": [
    "Easy to layer and easy to carry. Wear it over a tee on mild days and over a sweatshirt when the evenings turn cold.",
    "A layer that earns its place on the hook by the door, ready for the walk to the market or the drive to Gulmarg.",
    "Cut for easy movement with room for a layer underneath.",
  ],
  "men-sweatshirts": [
    "Soft inside, sturdy outside, and easy to wash and wear again.",
    "Comfortable enough for the sofa, presentable enough for the market. Layer it under a jacket when the weather turns.",
    "An everyday layer that works on its own in spring and under a jacket in winter.",
  ],
  "men-t-shirts": [
    "A straightforward tee that keeps its shape after washing. Wear it alone in summer or as a base layer in winter.",
    "Soft, breathable and easy to live in.",
    "Everyday basics done properly: clean neckline, honest fit, no loud logos.",
  ],
  "men-track-pants": [
    "Easy to move in and easy to wash. For walks, work around the house and the drive to Gulmarg.",
    "Comfortable from the first wear: the pair you reach for on a slow morning.",
    "An everyday pant that goes from a morning walk to the market without a second thought.",
  ],
  "men-shorts": [
    "For warm afternoons and the days you spend on your feet. Light, breathable and quick to dry.",
    "An easy pull-on short with a comfortable waistband and enough length to look right.",
  ],
  "men-vests": [
    "A base layer for winter and a standalone for summer. Soft against the skin and easy to wash.",
    "Wear it under a shirt, a hoodie or a sweater. Light, breathable and cut to move.",
  ],
  "women-jackets": [
    "A layer for breezy mornings and cool evenings, cut to move with you and easy to throw over anything.",
    "Warm without the weight. Zip it up when the wind picks up, open it when the sun comes out.",
    "Clean lines and an easy cut that works over a sweater, a long top or jeans.",
  ],
  "women-sweatshirts": [
    "Soft and easy for the cooler months. Wear it on its own indoors or under a coat when you step out.",
    "Comfortable enough to live in, neat enough to wear out. Washes well and keeps its shape.",
    "An everyday layer for the days the weather cannot decide.",
  ],
  "women-tops": [
    "Light, breathable and easy to wear. Pairs with jeans, a long skirt or palazzos.",
    "Soft on the skin and relaxed through the body: the top you reach for without thinking.",
    "A neat everyday top with a little detail, for college, work or visiting family.",
  ],
  "women-leggings": [
    "Comfortable for the whole day. Wear them with a long top, a hoodie or a sweatshirt.",
    "A waistband that stays put and a fabric that moves with you. For walks, errands and everything between.",
  ],
  "accessories-bags": [
    "Sturdy, well-organised and made to be carried every day. Zips run smoothly and straps hold their shape.",
    "From the school bus to the Srinagar bus stand, a bag that keeps everything in its place.",
    "Roomy where it counts, with pockets for the small things you always lose.",
  ],
  "accessories-beanies": [
    "A warm knit for the valley's winter. Soft against the forehead and snug over the ears.",
    "The finishing layer for a cold morning. Pairs with a hoodie, a puffer or an overcoat.",
  ],
};

export const WASH_BY_CAT = { "accessories-bags": WASH_BAG, "accessories-beanies": WASH_WOOL };
export const DEFAULT_WASH = WASH;

// Sizes offered per category (stock is generated per size).
export const SIZES_BY_CAT = {
  "men-t-shirts": ["S", "M", "L", "XL", "XXL"], "men-sweatshirts": ["S", "M", "L", "XL", "XXL"], "men-jackets": ["S", "M", "L", "XL", "XXL"],
  "men-track-pants": ["30", "32", "34", "36", "38"], "men-shorts": ["30", "32", "34", "36", "38"], "men-vests": ["S", "M", "L", "XL", "XXL"],
  "women-tops": ["XS", "S", "M", "L", "XL"], "women-sweatshirts": ["XS", "S", "M", "L", "XL"], "women-jackets": ["XS", "S", "M", "L", "XL"], "women-leggings": ["XS", "S", "M", "L", "XL"],
  "accessories-bags": ["Free Size"], "accessories-beanies": ["Free Size"],
};

// ── Site artwork: hero and collection compositions (photo references as in CATEGORIES) ──
// A hero can instead use a photo of someone wearing the clothes: `shot` is a desertcart photo id with its
// `listing` (demo only, like SHOTS), or `scene` is a lifestyle photo in ./source that fills the whole slide
// (`focus`: where the subject stands, 0 to 1 across the photo).
export const HEROES = [
  // The shop's own photo, taken on the road near Tangmarg.
  { name: "hero-winter", scene: "hero-winter.jpg", focus: 0.445 },
  { name: "hero-everyday", photo: "Slub Henley Tee/Sand" },
];

// Collections pick their products by category, tag, badge and price, mixing categories.
export const COLLECTIONS = [
  { slug: "winter-layers", name: "Winter Layers", description: "Puffers, parkas, fleece and hoodies for the valley's cold, for men and women.", photo: "Fur-Trim Hooded Parka/Black", cats: ["men-jackets", "men-sweatshirts", "women-jackets", "women-sweatshirts"], tag: "winter", limit: 16 },
  { slug: "everyday-essentials", name: "Everyday Essentials", description: "Tees, vests, tops, track pants and leggings under ₹1,500. The pieces that carry a week.", photo: "Soft Crew Tee/Sky blue", cats: ["men-t-shirts", "men-vests", "men-track-pants", "women-tops", "women-leggings"], limit: 16, maxPrice: 1500 },
  { slug: "travel-edit", name: "The Travel Edit", description: "Trolleys, duffles, backpacks and a warm beanie for the road to Srinagar and beyond.", photo: "Three-Piece Trolley Set/Black", cats: ["accessories-bags", "accessories-beanies"], limit: 16 },
  { slug: "new-season", name: "New Season", description: "The latest arrivals across the mall.", photo: "Belted Trench Coat/Red", badge: "New", limit: 16 },
];

// Words the generated copy must never contain (checked by build.mjs before anything is written).
export const BANNED_COPY = [
  /\bkurtas?\b/i, /\bpherans?\b/i, /\bsarees?\b/i, /\bfootwear\b/i,
  /\bluxurious\b/i, /\bslimming\b/i, /\bflattering\b/i, /\bbuy two\b/i, /\bfeminine\b/i, /\bcomfy\b/i, /\bstylish\b/i, /\bsuperior\b/i, /\bpremium\b/i,
  /\bluma\b/i, /\bvelcro\b/i, /\bnapoleon\b/i, /\bphony\b/i, /\bsherpa\b/i, /\brouch/i, /\bjackshirt\b/i, /\bcashmere\b/i, /\bgenuine\b/i,
  /&[a-z]+;/i, /[!]/,
  /\bcolor\b/i, /\bodor\b/i, /elasticized/i, /\borganizer\b/i, /\bgray\b/i,
];
