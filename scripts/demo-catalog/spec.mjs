// Demo catalog spec: the copy, colours and mappings for the built-in demo catalog.
// build.mjs turns it into src/data/demo-products.js and the photos in public/image/products.
//
// Photos: Magento Luma sample data (OSL 3.0) for apparel and bags, Sylius fixtures (MIT) for beanies.
// Every title, description, colour name and detail below was written from the photos themselves,
// not from the sample data's own copy (which often describes a different garment). When you change
// a photo mapping, open the photos and check the copy still matches what is in them.

// ── Colours ──────────────────────────────────────────────────────────────────
// One short vocabulary so the storefront's colour filter stays useful. A variant can override the
// hex when its shade differs from the default (see `colors` on a product).
export const COLOR_HEX = {
  Black: "#1a1a1a", White: "#f4f4f4", Cream: "#efe7d6", "Heather grey": "#cfcfcc", Grey: "#8c8c8c", Charcoal: "#4a4749",
  Slate: "#4b4a5c", Navy: "#232b4a", Blue: "#2f55c4", "Sky blue": "#5aaaf0", Indigo: "#3f3584", Teal: "#2aa0a6",
  Mint: "#9ad8bf", Green: "#1f7a52", "Bottle green": "#1f4a3d", Olive: "#6b6450", Khaki: "#a89f86", Sand: "#d8cdb4",
  Tan: "#c69c6d", Brown: "#735752", Yellow: "#e8df8a", Lime: "#d8e46a", Mustard: "#d69640", Orange: "#ec7d3c",
  Peach: "#f6b672", Coral: "#ec7a7f", Pink: "#f098ab", Red: "#c0282a", Maroon: "#6e2230", Berry: "#9c3a78",
  Purple: "#5b44a0", Lavender: "#a8a0d6", Multicolour: "#c98a4a",
};

// Magento's own colour names, used when a product does not rename a colour.
export const COLOR_RENAME = { Gray: "Grey" };

const WASH = "Machine wash cold with similar colours. Do not bleach. Tumble dry low or line dry.";
const WASH_BAG = "Wipe clean with a damp cloth. Air dry away from direct heat.";
const WASH_WOOL = "Hand wash cold. Reshape and dry flat.";

// ── Categories the demo products use: [key, size set, category photo "SKU/Magento colour"] ──
// Names and descriptions live in src/data/catalog.js (CATEGORIES); build.mjs checks they agree.
export const CATEGORIES = [
  ["men-t-shirts", "apparel", "MS01/Black"],
  ["men-sweatshirts", "apparel", "MH01/Gray"],
  ["men-jackets", "apparel", "MJ11/Black"],
  ["men-track-pants", "waist", "MP07/Blue"],
  ["men-shorts", "waist", "MSH05/Gray"],
  ["men-vests", "apparel", "MT02/White"],
  ["women-tops", "apparel", "WS07/Black"],
  ["women-sweatshirts", "apparel", "WH10/Gray"],
  ["women-jackets", "apparel", "WJ10/Yellow"],
  ["women-leggings", "apparel", "WP04/Blue"],
  ["accessories-bags", "free", "24-MB03/black"],
  ["accessories-beanies", "free", "cap-06/Black"],
].map(([key, sizeSet, image]) => ({ key, department: key.split("-")[0], sizeSet, image }));

// ── Apparel (Magento configurable SKUs) ──────────────────────────────────────
// colors:     { MagentoColour: "Name" | ["Name", "#hex"] } renames a colour (all photographed colours are used)
// omit:       Magento colours to leave out
// skip:       photo file names (without .jpg) to leave out, e.g. detail shots in a different shade
// highlights: short, factual bullets for the Product details table (only what the photos show)
// more:       replaces the category's rotating second paragraph
const A = (sku, cat, title, short, price, mrp, extra = {}) => ({ sku, cat, title, short, price, mrp, badge: "", details: {}, tags: [], highlights: [], ...extra });

export const APPAREL = [
  // Men · jackets
  A("MJ01", "men-jackets", "Summit Hooded Windbreaker", "Light, wind-cutting shell with a drawcord hood and reflective trim on the sleeves.", 2299, 2999, {
    badge: "Bestseller",
    colors: { Yellow: "Lime", Orange: ["Orange", "#f3b968"], Red: "Coral" },
    details: { fabric: "Lightweight nylon", fit: "Regular", closure: "Full zip", neck: "Drawcord hood" },
    highlights: ["Vented back yoke", "Reflective trim on the sleeves", "Curved back hem"],
    tags: ["rain"],
  }),
  A("MJ02", "men-jackets", "Lightweight Quarter-Zip Top", "Smooth, light quarter-zip with a contrast zip and a curved back hem.", 1799, 2299, {
    colors: { Green: ["Mint", "#cbe6ae"], Orange: ["Orange", "#f7b45a"], Red: "Pink" },
    details: { fabric: "Lightweight performance knit", fit: "Regular", closure: "Quarter zip", neck: "Stand collar" },
    highlights: ["Contrast zip"],
  }),
  A("MJ03", "men-jackets", "Quilted Hooded Jacket", "Box-quilted, insulated jacket with a hood and a contrast zip, for the coldest weeks.", 3299, 4299, {
    badge: "New",
    colors: { Red: ["Red", "#cb504e"] },
    details: { fabric: "Quilted polyester shell, synthetic fill", fit: "Regular", closure: "Full zip", neck: "Hooded" },
    highlights: ["Contrast zip", "Two hand pockets"],
    tags: ["winter"],
    more: "Warm enough for a January morning in Kunzer, light enough to wear all day. Layer a hoodie underneath when the snow comes down.",
  }),
  A("MJ04", "men-jackets", "Trail Quarter-Zip Pullover", "Long-sleeve quarter-zip with a bright contrast zip, for runs and cool mornings.", 1999, 2599, {
    details: { fabric: "Performance knit", fit: "Regular", closure: "Quarter zip", neck: "Stand collar" },
    highlights: ["Contrast zip"],
  }),
  A("MJ06", "men-jackets", "Piped Track Jacket", "Full-zip track jacket with a stand collar and contrast white piping.", 1999, 2599, {
    details: { fabric: "Textured knit", fit: "Relaxed", closure: "Full zip", neck: "Stand collar" },
    highlights: ["Contrast piping at the collar and zip"],
  }),
  A("MJ07", "men-jackets", "Polar Fleece Jacket", "Full-zip polar fleece with grey side panels and zip hand pockets.", 2399, 2999, {
    details: { fabric: "Polar fleece", fit: "Regular", closure: "Full zip", neck: "Stand collar" },
    highlights: ["Zip hand pockets", "Contrast side panels"],
    tags: ["winter"],
  }),
  A("MJ08", "men-jackets", "Heathered Fleece Jacket", "Soft heathered fleece with a full zip and a stand collar.", 2499, 3199, {
    colors: { Gray: "Charcoal" },
    details: { fabric: "Heathered fleece", fit: "Regular", closure: "Full zip", neck: "Stand collar" },
    highlights: ["Hand pockets"],
    tags: ["winter"],
  }),
  A("MJ09", "men-jackets", "Quarter-Zip Training Top", "Long-sleeve quarter-zip with a stand collar and a clean, close fit.", 1899, 2499, {
    colors: { Yellow: ["Yellow", "#dcd982"], Blue: "Teal" },
    details: { fabric: "Smooth performance knit", fit: "Regular", closure: "Quarter zip", neck: "Stand collar" },
  }),
  A("MJ10", "men-jackets", "Thermal Half-Zip Pullover", "Smooth half-zip pullover with a stand collar, a light layer for cool mornings.", 2199, 2799, {
    colors: { Red: ["Red", "#e04c3f"], Orange: "Mustard" },
    details: { fabric: "Brushed-back performance knit", fit: "Regular", closure: "Half zip", neck: "Stand collar" },
  }),
  A("MJ11", "men-jackets", "Fleece-Lined Flight Jacket", "A clean bomber with ribbed collar, cuffs and hem, and a zip pocket on the sleeve.", 3499, 4499, {
    badge: "Bestseller",
    colors: { Red: ["Red", "#c14a43"] },
    details: { fabric: "Polyester shell, microfleece lining", fit: "Regular", closure: "Full zip", neck: "Ribbed collar" },
    highlights: ["Zip pocket on the sleeve", "Ribbed collar, cuffs and hem"],
    tags: ["winter"],
  }),
  A("MJ12", "men-jackets", "Brushed Quarter-Zip Pullover", "Brushed quarter-zip with a stand collar, for crisp days.", 1999, 2599, {
    colors: { Orange: "Mustard" },
    details: { fabric: "Brushed polyester knit", fit: "Regular", closure: "Quarter zip", neck: "Stand collar" },
    tags: ["autumn"],
  }),
  // Men · sweatshirts & hoodies
  A("MH01", "men-sweatshirts", "Henley Hoodie", "Lightweight hoodie with a button placket, a patch chest pocket and contrast sleeves.", 1499, 1999, {
    badge: "Bestseller",
    colors: { Orange: "Mustard" },
    details: { fabric: "Lightweight heathered jersey", fit: "Regular", sleeve: "Full raglan", neck: "Drawstring hood", closure: "Button placket" },
    highlights: ["Patch chest pocket", "Contrast grey sleeves"],
  }),
  A("MH02", "men-sweatshirts", "Brushed Pullover Hoodie", "Slim, lightweight pullover hoodie in a soft brushed jersey.", 1599, 1999, {
    colors: { Purple: "Lavender" },
    details: { fabric: "Brushed jersey", fit: "Slim", sleeve: "Full", neck: "Hood" },
  }),
  A("MH03", "men-sweatshirts", "Water-Repellent Zip Hoodie", "Full-zip hoodie with a lined hood, hand pockets and breathable mesh side panels.", 1999, 2499, {
    details: { fabric: "Water-repellent polyester fleece", fit: "Regular", sleeve: "Full", neck: "Drawstring hood", closure: "Full zip" },
    highlights: ["Mesh side panels", "Contrast hood lining"],
    tags: ["rain", "winter"],
  }),
  A("MH04", "men-sweatshirts", "Fleece Crewneck Sweatshirt", "Soft raglan crewneck with a V-stitch at the neck, cut relaxed.", 1499, 1899, {
    colors: { Green: "Mint", Yellow: ["Yellow", "#e0d07f"] },
    details: { fabric: "Soft brushed fleece", fit: "Relaxed", sleeve: "Full raglan", neck: "Crew" },
  }),
  A("MH05", "men-sweatshirts", "Colour-Block Crew Sweatshirt", "Raglan crewneck with contrast navy sleeves and trim.", 1599, 1999, {
    colors: { White: "Cream", Green: "Mint", Red: "Pink" },
    details: { fabric: "Heavy fleece", fit: "Relaxed", sleeve: "Full raglan", neck: "Crew" },
    highlights: ["Navy sleeves, collar and hem"],
    tags: ["winter"],
  }),
  A("MH06", "men-sweatshirts", "Speckled Zip Hoodie", "Light, speckled jersey zip hoodie with contrast drawcords.", 1499, 1999, {
    badge: "New",
    skip: ["mh06-blue_alt1", "mh06-blue_back"],
    details: { fabric: "Speckled cotton-blend jersey", fit: "Regular", sleeve: "Full", neck: "Drawstring hood", closure: "Full zip" },
  }),
  A("MH07", "men-sweatshirts", "Colour-Block Zip Hoodie", "Full-zip hoodie with a black yoke and hood over a heathered body, and hand pockets.", 1799, 2299, {
    details: { fabric: "Heathered fleece", fit: "Standard", sleeve: "Full", neck: "Drawcord hood", closure: "Full zip" },
    tags: ["winter"],
  }),
  A("MH08", "men-sweatshirts", "Trek Pullover Hoodie", "Fleece pullover with a printed chest panel, a kangaroo pocket and a drawstring hood.", 1499, 1899, {
    colors: { Brown: "Olive", Purple: "Lavender" },
    details: { fabric: "Soft lined fleece", fit: "Regular", sleeve: "Full", neck: "Drawstring hood" },
    highlights: ["Printed chest panel", "Kangaroo pocket"],
    tags: ["winter"],
  }),
  A("MH09", "men-sweatshirts", "Heathered Raglan Hoodie", "Light heathered hoodie with raglan sleeves and contrast stitching.", 1599, 1999, {
    badge: "Bestseller",
    colors: { Blue: "Teal", Green: "Mint", Red: "Coral" },
    skip: ["mh09-blue_alt1", "mh09-blue_back"],
    details: { fabric: "Light heathered jersey", fit: "Regular", sleeve: "Full raglan", neck: "Drawstring hood" },
    highlights: ["Contrast stitching"],
  }),
  A("MH10", "men-sweatshirts", "Street Crewneck Sweatshirt", "Light, heathered long-sleeve crewneck for everyday layering.", 1299, 1699, {
    skip: ["mh10-blue_alt1", "mh10-blue_back"],
    details: { fabric: "Heathered jersey", fit: "Regular", sleeve: "Full raglan", neck: "Crew" },
  }),
  A("MH11", "men-sweatshirts", "Classic Cotton Crewneck", "Textured raglan crewneck with black ribbed trim and a V-stitch at the neck.", 1699, 2199, {
    colors: { White: ["Heather grey", "#d9d9d6"], Orange: "Mustard" },
    details: { fabric: "80% cotton, 20% polyester", fit: "Regular", sleeve: "Full raglan", neck: "Crew" },
    highlights: ["Black ribbed collar, cuffs and hem"],
  }),
  A("MH12", "men-sweatshirts", "Striped Zip Hoodie", "Full-zip hoodie in a soft two-tone stripe, with hand pockets and a drawstring hood.", 1799, 2299, {
    colors: { Green: ["Green", "#7f9c8c"], Blue: ["Teal", "#4f8f86"], Red: "Maroon" },
    details: { fabric: "Striped cotton-blend terry", fit: "Regular", sleeve: "Full", neck: "Drawstring hood", closure: "Full zip" },
  }),
  A("MH13", "men-sweatshirts", "Featherweight Zip Hoodie", "Featherweight heathered zip hoodie for cool evenings.", 1699, 2199, {
    colors: { Blue: "Teal", Green: "Mint" },
    skip: ["mh13-blue_alt1", "mh13-blue_back"],
    details: { fabric: "Featherweight heathered jersey", fit: "Regular", sleeve: "Full", neck: "Hood", closure: "Full zip" },
  }),
  // Men · t-shirts
  A("MS01", "men-t-shirts", "Everyday Crew Tee", "Classic crew tee in a light, quick-drying knit.", 599, 899, {
    badge: "Bestseller",
    colors: { Brown: ["Sand", "#d8cdb4"] },
    details: { fabric: "100% polyester knit", fit: "Relaxed", sleeve: "Half", neck: "Crew" },
  }),
  A("MS02", "men-t-shirts", "Featherweight V-Neck Tee", "Featherweight blend with a clean V-neck.", 649, 899, {
    colors: { Gray: "Heather grey", Blue: "Teal" },
    details: { fabric: "Featherweight blend", fit: "Relaxed", sleeve: "Half", neck: "V-neck" },
  }),
  A("MS03", "men-t-shirts", "Semi-Fitted Crew Tee", "Semi-fitted crew with nothing to fuss over.", 699, 999, {
    colors: { Orange: "Mustard" },
    details: { fabric: "Quick-dry performance knit", fit: "Semi-fitted", sleeve: "Half", neck: "Crew" },
  }),
  A("MS04", "men-t-shirts", "Breathable Crew Tee", "Light, breathable crew tee with a relaxed drape.", 699, 999, {
    colors: { Red: "Pink" },
    details: { fabric: "Micro polyester knit", fit: "Relaxed", sleeve: "Half", neck: "Crew" },
  }),
  A("MS05", "men-t-shirts", "Stretch-Gusset Tee", "Raglan tee with stretch gussets under the arms for movement.", 649, 899, {
    colors: { Blue: "Teal" },
    details: { fabric: "Moisture-wicking knit", fit: "Regular", sleeve: "Half raglan", neck: "Crew" },
  }),
  A("MS06", "men-t-shirts", "Relaxed Gym Tee", "Relaxed crew tee with contrast curved panels at the shoulders.", 699, 999, {
    colors: { Blue: "Sky blue", Green: "Mint" },
    skip: ["ms06-blue_alt1", "ms06-blue_back"],
    details: { fabric: "Soft performance knit", fit: "Relaxed", sleeve: "Half", neck: "Crew" },
    highlights: ["Contrast shoulder panels"],
  }),
  A("MS07", "men-t-shirts", "Long-Sleeve Crew Tee", "Fitted long-sleeve raglan tee with contrast flatlock stitching.", 999, 1299, {
    badge: "New",
    colors: { Green: "Grey" },
    details: { fabric: "Quick-dry knit", fit: "Fitted", sleeve: "Full raglan", neck: "Crew" },
    highlights: ["Contrast flatlock stitching"],
  }),
  A("MS08", "men-t-shirts", "Long-Sleeve Ribbed Tee", "Loose long-sleeve crew with ribbed cuffs and collar.", 999, 1299, {
    colors: { Red: ["Red", "#b0432a"] },
    details: { fabric: "Sweat-wicking knit", fit: "Loose", sleeve: "Full", neck: "Ribbed crew" },
  }),
  A("MS09", "men-t-shirts", "Crew-Neck Performance Tee", "Relaxed crew with black shoulder panels and a featherweight feel.", 749, 999, {
    details: { fabric: "Featherweight polyester", fit: "Relaxed", sleeve: "Half", neck: "Crew" },
    highlights: ["Black shoulder panels"],
  }),
  A("MS10", "men-t-shirts", "Soft Crew Tee", "Soft, lightweight crew with flat-lock seams.", 599, 899, {
    colors: { Blue: "Navy", Red: ["Red", "#9e1b20"] },
    details: { fabric: "Soft lightweight knit", fit: "Semi-fitted", sleeve: "Half", neck: "Crew" },
  }),
  A("MS11", "men-t-shirts", "Heathered V-Neck Tee", "Ultra-light heathered V-neck for warm afternoons.", 699, 999, {
    colors: { Green: "Mint", Blue: "Sky blue" },
    details: { fabric: "Ultra-light heathered knit", fit: "Regular", sleeve: "Half", neck: "V-neck" },
  }),
  A("MS12", "men-t-shirts", "Raglan Crew Tee", "Raglan tee with flat seams and a reflective stripe on the sleeve.", 699, 999, {
    colors: { Blue: "Sky blue" },
    details: { fabric: "Ultra-light polyester", fit: "Regular", sleeve: "Half raglan", neck: "Crew" },
    highlights: ["Reflective sleeve stripe"],
  }),
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
  // Men · vests
  A("MT01", "men-vests", "Sleeveless Training Vest", "Light, sleeveless crew-neck vest made to wick and breathe.", 399, 599, {
    colors: { Gray: "Teal", Orange: "Peach" },
    details: { fabric: "Performance knit", fit: "Regular", neck: "Crew" },
  }),
  A("MT02", "men-vests", "Ribbed Crew Vest", "Relaxed sleeveless vest with a ribbed crew neckline and contrast seams.", 399, 599, {
    badge: "Bestseller",
    details: { fabric: "Cotton-blend knit", fit: "Relaxed", neck: "Ribbed crew" },
  }),
  A("MT03", "men-vests", "Pocket Tank Vest", "Heathered scoop-neck tank with a contrast chest pocket.", 449, 699, {
    colors: { Red: "Coral", Blue: ["Blue", "#1a7fd0"] },
    details: { fabric: "Heathered cotton-blend jersey", fit: "Regular", neck: "Scoop" },
  }),
  A("MT04", "men-vests", "Relaxed Pocket Tank", "Soft heathered tank with a relaxed fit and a contrast chest pocket.", 449, 699, {
    colors: { Blue: ["Blue", "#5d6fb8"] },
    details: { fabric: "Heathered cotton-blend jersey", fit: "Relaxed", neck: "Scoop" },
  }),
  A("MT08", "men-vests", "Classic Sleeveless Vest", "Clean, sleeveless crew-neck vest in a soft jersey.", 499, 699, {
    colors: { Green: ["Green", "#0f8a70"] },
    details: { fabric: "Cotton-blend jersey", fit: "Regular", neck: "Crew" },
  }),
  A("MT09", "men-vests", "Cotton Sleeveless Vest", "Soft cotton sleeveless vest with a clean crew neck.", 399, 599, {
    colors: { Blue: "Sky blue" },
    details: { fabric: "100% cotton jersey", fit: "Regular", neck: "Crew" },
  }),
  // Women · jackets
  A("WJ01", "women-jackets", "Ruched Half-Zip Pullover", "Half-zip pullover with a ruched placket and a snap-tab collar.", 2199, 2799, {
    colors: { Red: ["Pink", "#f2557a"], Blue: "Teal" },
    details: { fabric: "Stretch performance knit", fit: "Regular", closure: "Half zip", neck: "Snap-tab collar" },
  }),
  A("WJ02", "women-jackets", "Cowl-Neck Pullover", "Long-sleeve pullover with a drawcord cowl neck.", 1999, 2599, {
    colors: { Gray: ["Navy", "#454a66"], Blue: ["Blue", "#1a6fbf"] },
    details: { fabric: "Stretch performance knit", fit: "Regular", neck: "Drawcord cowl" },
  }),
  A("WJ03", "women-jackets", "Collared Half-Zip Pullover", "Half-zip pullover with a fold-down collar and a front pouch pocket.", 1999, 2599, {
    badge: "Bestseller",
    colors: { Red: ["Pink", "#f7b3c6"], Orange: "Mustard" },
    details: { fabric: "Smooth stretch knit", fit: "Regular", closure: "Half zip", neck: "Fold-down collar" },
  }),
  A("WJ04", "women-jackets", "Slim Running Jacket", "Slim full-zip jacket with a stand collar and a mesh-vented back.", 2999, 3699, {
    colors: { Orange: "Mustard", Red: "Coral" },
    details: { fabric: "Lightweight woven polyester", fit: "Slim", closure: "Full zip", neck: "Stand collar" },
    highlights: ["Mesh back vent"],
  }),
  A("WJ05", "women-jackets", "Basic Full-Zip Jacket", "Fitted, heathered full-zip with a ruched front and a zip pocket at the back.", 2199, 2799, {
    colors: { Green: "Mint", Red: "Coral" },
    details: { fabric: "Heathered stretch knit", fit: "Fitted", closure: "Full zip", neck: "Stand collar" },
    highlights: ["Ruched front", "Zip pocket at the back"],
  }),
  A("WJ06", "women-jackets", "Hooded Puffer Jacket", "Quilted, insulated puffer with a lined hood and a contrast zip.", 3299, 4199, {
    colors: { Blue: ["Blue", "#1a82dc"], Green: "Mint" },
    details: { fabric: "Quilted polyester, synthetic fill", fit: "Regular", closure: "Full zip", neck: "Lined hood" },
    highlights: ["Contrast zip", "Hand pockets"],
    tags: ["winter"],
    more: "Light to carry and warm to wear: the jacket for school runs, market mornings and the first snow of the season.",
  }),
  A("WJ07", "women-jackets", "Inset Full-Zip Jacket", "Fitted full-zip with heathered side insets and a stand collar.", 2199, 2799, {
    colors: { Purple: "Berry", Orange: "Mustard", Red: "Coral" },
    details: { fabric: "Performance knit with heathered insets", fit: "Fitted", closure: "Full zip", neck: "Stand collar" },
  }),
  A("WJ08", "women-jackets", "Trek Quarter-Zip Pullover", "Fitted quarter-zip with thumbholes and a zip pocket at the back.", 2099, 2699, {
    colors: { Gray: "Charcoal", Orange: "Mustard" },
    details: { fabric: "Heathered stretch knit", fit: "Fitted", closure: "Quarter zip", neck: "Stand collar" },
    highlights: ["Thumbholes", "Zip pocket at the back"],
  }),
  A("WJ09", "women-jackets", "Lightweight Quarter-Zip", "Light quarter-zip with contrast stitching and thumbholes.", 1499, 1999, {
    badge: "New",
    colors: { Green: "Mint", Blue: ["Green", "#3f8a6a"] },
    details: { fabric: "Lightweight quick-dry knit", fit: "Regular", closure: "Quarter zip", neck: "Stand collar" },
    highlights: ["Contrast stitching", "Thumbholes"],
  }),
  A("WJ10", "women-jackets", "Ruffle-Back Quarter-Zip", "Fitted quarter-zip with a ruffled back seam and a reflective strip.", 1999, 2599, {
    badge: "Bestseller",
    colors: { Yellow: "Lime", Orange: "Mustard" },
    details: { fabric: "Smooth performance knit", fit: "Fitted", closure: "Quarter zip", neck: "Stand collar" },
    highlights: ["Ruffled back seam", "Reflective strip at the back"],
  }),
  A("WJ11", "women-jackets", "Mesh-Back Quarter-Zip", "Close-fitting quarter-zip with a mesh back panel and a ruffled seam.", 2199, 2799, {
    colors: { Blue: ["Blue", "#1a7fd8"], Orange: "Mustard" },
    details: { fabric: "Performance knit, mesh back", fit: "Fitted", closure: "Quarter zip", neck: "Stand collar" },
    highlights: ["Mesh back panel"],
  }),
  A("WJ12", "women-jackets", "Piped Quarter-Zip Pullover", "Quarter-zip with contrast piping over the shoulders and down the sleeves.", 2199, 2799, {
    badge: "New",
    colors: { Blue: ["Blue", "#3e95dc"] },
    details: { fabric: "Lightweight knit", fit: "Regular", closure: "Quarter zip", neck: "Stand collar" },
    highlights: ["Contrast piping"],
  }),
  // Women · sweatshirts & hoodies
  A("WH01", "women-sweatshirts", "Slub-Knit Cowl Hoodie", "Light slub-knit hoodie with a draped cowl neck and a drawstring.", 1599, 1999, {
    badge: "Bestseller",
    colors: { Green: "Green", Orange: "Peach", Purple: "Lavender" },
    skip: ["wh01-green_alt1", "wh01-green_back"],
    details: { fabric: "Slub-knit jersey", fit: "Regular", sleeve: "Full", neck: "Cowl with hood" },
  }),
  A("WH02", "women-sweatshirts", "Contrast-Stitch Pullover Hoodie", "Light raglan hoodie with contrast stitching.", 1499, 1899, {
    colors: { Blue: "Teal", Orange: "Peach" },
    details: { fabric: "Soft jersey", fit: "Regular", sleeve: "Full raglan", neck: "Drawstring hood" },
    highlights: ["Contrast stitching"],
  }),
  A("WH03", "women-sweatshirts", "Short-Sleeve Cowl-Neck Sweatshirt", "Ultra-soft knit with a draped cowl neck and short sleeves.", 1599, 1999, {
    colors: { Green: "Mint" },
    skip: ["wh03-red_alt1", "wh03-red_back"],
    details: { fabric: "Ultra-soft brushed knit", fit: "Relaxed", sleeve: "Short", neck: "Cowl neck" },
  }),
  A("WH04", "women-sweatshirts", "Two-Tone Pullover Hoodie", "Raglan hoodie with contrast sleeves, a kangaroo pocket and a V-stitch at the neck.", 1899, 2399, {
    colors: { Blue: "Teal", Orange: "Mustard", Purple: "Lavender" },
    details: { fabric: "Two-tone fleece", fit: "Regular", sleeve: "Full raglan", neck: "Scoop with hood" },
    highlights: ["Kangaroo pocket"],
  }),
  A("WH05", "women-sweatshirts", "Three-Quarter Sleeve Zip Hoodie", "Semi-fitted zip hoodie with three-quarter sleeves.", 1499, 1899, {
    colors: { Orange: "Peach", Purple: "Lavender" },
    skip: ["wh05-white_back"],
    details: { fabric: "Heathered fleece", fit: "Semi-fitted", sleeve: "Three-quarter", neck: "Hood", closure: "Full zip" },
  }),
  A("WH06", "women-sweatshirts", "Heather Full-Zip Hoodie", "Full-zip hoodie with a coral contrast zip and a zip chest pocket.", 1799, 2299, {
    colors: { Purple: "Indigo" },
    details: { fabric: "Four-way stretch fleece", fit: "Regular", sleeve: "Full", neck: "Hood", closure: "Full zip" },
    highlights: ["Zip chest pocket", "Thumbholes"],
    tags: ["winter"],
  }),
  A("WH07", "women-sweatshirts", "Contrast-Lined Zip Hoodie", "Full-zip hoodie with a contrast hood lining, a zip chest pocket and a plush inside.", 1799, 2299, {
    badge: "New",
    colors: { Gray: ["Heather grey", "#acaab8"], Purple: "Lavender" },
    details: { fabric: "Plush-lined fleece", fit: "Regular", sleeve: "Full", neck: "Drawstring hood", closure: "Full zip" },
    highlights: ["Zip chest pocket", "Contrast hood lining"],
    tags: ["winter"],
  }),
  A("WH08", "women-sweatshirts", "Half-Zip Hooded Top", "Half-zip hooded top with contrast panels, flatlock seams and thumbhole cuffs.", 1599, 1999, {
    colors: { Orange: "Peach", Purple: "Lavender" },
    details: { fabric: "Stretch cotton blend", fit: "Regular", sleeve: "Full", neck: "Hood", closure: "Half zip" },
    highlights: ["Thumbhole cuffs", "Contrast flatlock seams"],
  }),
  A("WH09", "women-sweatshirts", "Perforated-Sleeve Hoodie", "Light raglan hoodie with contrast perforated sleeves.", 1299, 1699, {
    colors: { Purple: ["Purple", "#6a50b0"], Green: ["Green", "#1f6b4a"], Red: ["Red", "#e0323a"] },
    details: { fabric: "Lightweight jersey", fit: "Regular", sleeve: "Full raglan", neck: "Hood" },
    highlights: ["Two-tone body and sleeves"],
  }),
  A("WH10", "women-sweatshirts", "Hooded Fleece Zip-Up", "Heathered fleece zip-up with a contrast hood lining and hand pockets.", 1699, 2199, {
    badge: "Bestseller",
    colors: { Gray: "Charcoal", Blue: ["Blue", "#1a8ee0"], Yellow: "Olive" },
    details: { fabric: "Smooth stretch fleece", fit: "Regular", sleeve: "Full", neck: "Hood", closure: "Full zip" },
    highlights: ["Hand pockets", "Contrast hood lining and cuffs"],
    tags: ["winter"],
  }),
  A("WH11", "women-sweatshirts", "V-Neck Hoodie", "Soft V-neck hoodie with a kangaroo pocket.", 1599, 2099, {
    colors: { Blue: ["Blue", "#1a6fbf"], Green: "Mint", Orange: "Mustard" },
    skip: ["wh11-blue_back"],
    details: { fabric: "Super-soft blend", fit: "Regular", sleeve: "Full", neck: "V-neck with hood" },
  }),
  A("WH12", "women-sweatshirts", "High-Pile Hooded Fleece", "Thick fleece zip hoodie with a black-lined hood and black cuffs.", 2199, 2799, {
    colors: { Green: ["Green", "#4c9174"] },
    details: { fabric: "High-pile fleece", fit: "Relaxed", sleeve: "Full", neck: "Lined hood", closure: "Full zip" },
    tags: ["winter"],
  }),
  // Women · tops
  A("WS01", "women-tops", "Endurance V-Neck Tee", "Light, breathable V-neck with contrast stitching.", 699, 999, {
    details: { fabric: "Ultra-light breathable blend", fit: "Regular", sleeve: "Half", neck: "V-neck" },
  }),
  A("WS02", "women-tops", "Micro-Sleeve V-Neck Top", "Slim fit with micro sleeves and a longer curved hem.", 749, 999, {
    badge: "Bestseller",
    colors: { Blue: "Teal", Red: ["Red", "#af3d45"] },
    skip: ["ws02-green_back"],
    details: { fabric: "Quick-dry anti-odour knit", fit: "Slim", sleeve: "Micro", neck: "V-neck", length: "Longer curved hem" },
  }),
  A("WS04", "women-tops", "Drop-Shoulder Tee", "Heathered tee with a roomy scoop neck and dropped shoulders.", 699, 999, {
    colors: { Blue: ["Blue", "#189bf9"], Red: ["Red", "#9e2a33"] },
    skip: ["ws04-green_back"],
    details: { fabric: "Lightweight heathered knit", fit: "Relaxed", sleeve: "Half drop shoulder", neck: "Wide scoop" },
  }),
  A("WS05", "women-tops", "Lightweight Fitness Tee", "Fitted, ultra-light scoop-neck tee.", 599, 899, {
    colors: { Orange: "Mustard", Yellow: ["Lime", "#c9c071"] },
    details: { fabric: "Performance knit", fit: "Fitted", sleeve: "Half", neck: "Scoop" },
  }),
  A("WS06", "women-tops", "Heathered V-Neck Tee", "Soft heathered V-neck with seams that move with you.", 649, 899, {
    colors: { Purple: "Berry" },
    details: { fabric: "Heathered wicking knit", fit: "Fitted", sleeve: "Half", neck: "V-neck" },
  }),
  A("WS07", "women-tops", "Scoop-Neck Ruched Tee", "Relaxed scoop neck with side ruching.", 899, 1199, {
    badge: "New",
    details: { fabric: "Soft polyester", fit: "Relaxed", sleeve: "Half", neck: "Scoop" },
    highlights: ["Side ruching"],
  }),
  A("WS08", "women-tops", "Classic V-Neck Training Tee", "Heathered, lightweight V-neck with flatlock seams.", 749, 999, {
    colors: { Blue: "Indigo", Black: "Charcoal" },
    details: { fabric: "Soft heathered knit", fit: "Regular", sleeve: "Half", neck: "V-neck" },
  }),
  A("WS09", "women-tops", "Longline Scoop Tee", "Longer length and a fitted cut, with a wide scoop neck.", 699, 999, {
    colors: { Blue: ["Blue", "#1a8ff0"], White: ["Heather grey", "#d8d8d8"] },
    skip: ["ws09-blue_back"],
    details: { fabric: "Soft knit", fit: "Fitted", sleeve: "Half", neck: "Scoop", length: "Longline" },
  }),
  A("WS10", "women-tops", "Semi-Fitted V-Neck Tee", "Semi-fitted burnout V-neck with micro sleeves.", 749, 999, {
    colors: { Red: "Pink", Green: "Mint" },
    details: { fabric: "Heathered burnout knit", fit: "Semi-fitted", sleeve: "Micro", neck: "V-neck" },
  }),
  A("WS11", "women-tops", "Micro-Sleeve Gym Tee", "Deep V-neck and micro sleeves in a light, wicking knit.", 699, 999, {
    colors: { Green: "Teal", Orange: "Mustard" },
    details: { fabric: "Lightweight wicking knit", fit: "Relaxed", sleeve: "Micro", neck: "Deep V-neck" },
  }),
  A("WS12", "women-tops", "Organic Cotton Scoop Tee", "Organic cotton blend with flat seams.", 799, 1099, {
    colors: { Orange: "Coral", Blue: "Sky blue", Purple: "Lavender" },
    details: { fabric: "67% organic cotton blend", fit: "Semi-fitted", sleeve: "Half", neck: "Scoop" },
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

// ── Beanies (Sylius fixture photos) ──────────────────────────────────────────
const C = (id, files, color, title, short, price, mrp, extra = {}) => ({ id, files, color, title, short, price, mrp, cat: "accessories-beanies", badge: "", details: { fabric: "Acrylic wool blend", fit: "One size", washCare: WASH_WOOL }, tags: ["winter"], highlights: [], ...extra });
export const CAPS = [
  C("cap-01", ["cap_01.webp"], "Maroon", "Fisherman-Rib Pom Beanie", "Deep fisherman-rib knit with a matching pom-pom.", 499, 699),
  C("cap-02", ["cap_02.webp"], "Bottle green", "Chunky Knit Beanie", "Oversized chunky knit with a slouchy crown.", 549, 799, { badge: "Bestseller" }),
  C("cap-03", ["cap_03.webp"], "Cream", "Faux-Fur Pom Beanie", "Cable knit with a soft faux-fur pom.", 599, 849),
  C("cap-04", ["cap_04.webp"], ["Berry", "#7a1f5c"], "Cuffed Wool Beanie", "Clean cuffed beanie in a fine knit.", 449, 649),
  C("cap-06", ["cap_06_1.webp", "cap_06_2.webp", "cap_06_3.webp"], "Black", "Ribbed Cuff Beanie", "Everyday ribbed beanie with a deep cuff.", 399, 599, { badge: "Bestseller" }),
  C("cap-07", ["cap_07_1.webp", "cap_07_2.webp", "cap_07_3.webp"], "Cream", "Pom-Pom Ribbed Beanie", "Ribbed knit with a generous faux-fur pom.", 499, 699),
  C("cap-08", ["cap_08_1.webp", "cap_08_3.webp"], "Cream", "Soft Cuffed Beanie", "A soft, roomy cuffed beanie that pulls down over the ears.", 449, 649, { badge: "New" }),
  C("cap-09", ["cap_09_1.webp", "cap_09_2.webp", "cap_09_3.webp"], "Black", "Classic Watch Cap", "The classic cuffed watch cap.", 399, 599),
  C("cap-12", ["cap_12.webp"], ["Multicolour", "#d9b39b"], "Marled Pom Beanie", "Pastel marled knit with a deep cuff and a mustard pom.", 549, 799),
  C("cap-13", ["cap_13_1.webp", "cap_13_2.webp", "cap_13_3.webp"], ["Grey", "#b3ada3"], "Slouch Knit Beanie", "Relaxed slouch beanie in a soft stone-grey knit.", 449, 649),
  C("cap-15", ["cap_15.webp"], ["Pink", "#d8a1ad"], "Contrast-Cuff Pom Beanie", "Marled pink knit with a pale contrast cuff and a pom.", 499, 699),
  C("cap-17", ["cap_17.webp"], "Multicolour", "Fair Isle Pom Beanie", "Striped fair isle knit with a mustard pom.", 599, 849, { badge: "New" }),
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
    "Light, quick to dry and easy to live in.",
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
    "Light enough to keep on all day. Zip it up when the wind picks up, open it when the sun comes out.",
    "Clean lines and an easy cut that works over leggings or jeans.",
  ],
  "women-sweatshirts": [
    "Soft and easy for the cooler months. Wear it on its own indoors or under a coat when you step out.",
    "Comfortable enough to live in, neat enough to wear out. Washes well and keeps its shape.",
    "An everyday layer for the days the weather cannot decide.",
  ],
  "women-tops": [
    "A light everyday tee that drapes well and dries quickly. Pairs with leggings, jeans or a long cardigan.",
    "Soft, breathable and easy: the top you reach for without thinking.",
    "Clean neckline, a soft hand and colours that hold after washing.",
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

// ── Site artwork: hero and collection compositions ("SKU/Magento colour") ────
export const HEROES = [
  { name: "hero-winter", photo: "MJ03/Black" },
  { name: "hero-everyday", photo: "WJ10/Yellow" },
];

// Collections pick their products by category, tag, badge and price, mixing categories.
export const COLLECTIONS = [
  { slug: "winter-layers", name: "Winter Layers", description: "Jackets, hoodies and fleece for the valley's cold, for men and women.", photo: "WH12/Gray", cats: ["men-jackets", "men-sweatshirts", "women-jackets", "women-sweatshirts"], tag: "winter", limit: 16 },
  { slug: "everyday-essentials", name: "Everyday Essentials", description: "Tees, vests, track pants and leggings under ₹1,500. The pieces that carry a week.", photo: "MS01/Black", cats: ["men-t-shirts", "men-vests", "men-track-pants", "women-tops", "women-leggings"], limit: 16, maxPrice: 1500 },
  { slug: "travel-edit", name: "The Travel Edit", description: "Duffles, backpacks and a warm beanie for the road to Srinagar and beyond.", photo: "24-MB03/black", cats: ["accessories-bags", "accessories-beanies"], limit: 16 },
  { slug: "new-season", name: "New Season", description: "The latest arrivals across the mall.", photo: "WJ12/Blue", badge: "New", limit: 16 },
];

// Words the generated copy must never contain (checked by build.mjs before anything is written).
export const BANNED_COPY = [
  /\bkurtas?\b/i, /\bpherans?\b/i, /\bsarees?\b/i, /\bfootwear\b/i,
  /\bluxurious\b/i, /\bslimming\b/i, /\bflattering\b/i, /\bbuy two\b/i, /\bfeminine\b/i, /\bcomfy\b/i, /\bstylish\b/i, /\bsuperior\b/i, /\bpremium\b/i,
  /\bluma\b/i, /\bvelcro\b/i, /\bnapoleon\b/i, /\bphony\b/i, /\bsherpa\b/i, /\brouch/i, /\bjackshirt\b/i,
  /&[a-z]+;/i, /[!]/,
  /\bcolor\b/i, /\bodor\b/i, /elasticized/i, /\borganizer\b/i, /\bgray\b/i,
];
