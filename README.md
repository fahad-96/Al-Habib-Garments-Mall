# Al Habib Garments Mall

Premium black-and-white storefront for Al Habib Garments Mall, Kunzer, Tangmarg, with WhatsApp
ordering and a secure admin dashboard for the catalog, orders, banners, coupons and reviews.

Built with **Vite + React 19 + Tailwind CSS + Framer Motion + Supabase**, deployed on Netlify.

## What it does

**Storefront**
- Home with editorial hero banners, department tiles, new-in and bestseller rails, collections,
  a dark feature band and store details.
- Men, Women and Kids departments, categories, New In, Sale, Collections and search, all with
  Myntra-style filters (category, size, colour, price, discount, availability), sorting and
  shareable filter URLs.
- Product pages with a zoomable gallery, colour and size variants with per-variant stock
  ("only 2 left", sold-out sizes crossed out), size guides, delivery details, product details,
  customer reviews, related and recently viewed products.
- Bag with coupons, price summary, delivery details form and **Place order on WhatsApp**: the
  order is saved with an order number and WhatsApp opens with the full order ready to send.
- Order tracking by order number and phone, wishlist, about, contact with map, size guide and
  policies pages.

**Admin** (`/admin`)
- Sign in with a 6-digit email code or a password. Only allow-listed emails get in.
- Dashboard with orders, revenue, low stock, pending reviews and one-click import of the built-in
  demo catalog.
- Products: full editor with colours, per-size stock, up to 8 photos per colour (compressed on
  upload), structured details, badges, tags; bulk hide, show and delete.
- Orders: status flow (new, confirmed, packed, shipped, delivered, cancelled) that reserves and
  releases stock automatically, WhatsApp the customer in one tap, notes, CSV export, packing slip.
- Categories, collections, hero and strip banners, coupons, review approval, size guides and
  store settings (WhatsApp number, address, hours, delivery fee, free delivery threshold, COD,
  announcement bar, about text).

## Quick start (storefront only, works immediately)

```bash
npm install
npm run dev
```

The site runs on the built-in demo catalog of 138 products with real product photography. The admin stays disabled until
Supabase is configured (it shows a setup notice instead of a fake login). WhatsApp ordering
works without a database; orders just are not saved or numbered.

## Enabling the admin, live catalog, saved orders, coupons and reviews

Follow [`supabase/ADMIN-SETUP.md`](supabase/ADMIN-SETUP.md). In short: create a free Supabase
project, put your admin email into [`supabase/schema.sql`](supabase/schema.sql), run that file in
the SQL editor, and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env` (locally) and to
Netlify (live). Then sign in at `/admin/login` and click **Import demo catalog**.

Once the database has at least one product, the live catalog replaces the demo one.

## Deploy to Netlify

Everything is preconfigured in [`netlify.toml`](netlify.toml) (build command, SPA redirects,
security headers, caching).

1. Push this repository to GitHub.
2. Netlify → **Add new site → Import an existing project** → pick the repo.
3. **Site configuration → Environment variables**: add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (only needed for the admin and live data).
4. Deploy.

## Product photos

The demo catalog ships with product photography saved in this repository, so the store looks
complete out of the box and never loads images from another site:

- Jackets, sweatshirts, t-shirts, vests, tops, beanies and travel bags use product-only photos (no
  models) from seller listings on desertcart.in. **They are other sellers' photos, for the
  presentation only**: replace them with the shop's own photos before selling. Every one is listed
  with its source in `public/image/ATTRIBUTIONS.md`.
- Track pants, shorts, leggings and the everyday bags use the Magento Luma sample data (OSL 3.0).

Upload your own photos from the admin product editor, on a phone or a laptop; they are compressed
to WebP in the browser and stored in Supabase Storage.

## Demo catalog

`src/data/demo-products.js`, the photos in `public/image/products` and the `hero-*`, `cat-*` and
`col-*` artwork in `public/image/art` are generated. Do not edit them by hand: change the copy,
colours, prices or photo mappings in [`scripts/demo-catalog/spec.mjs`](scripts/demo-catalog/spec.mjs)
and regenerate. You need the Magento sample data checked out somewhere on your machine:

```bash
git clone --depth 1 https://github.com/magento/magento2-sample-data.git ../magento2-sample-data
npm i --no-save sharp   # image resizing, only needed for this script
MAGENTO_SAMPLE_DIR=../magento2-sample-data node scripts/demo-catalog/build.mjs
```

The script downloads the product-only photos listed in `SHOTS` once into
`node_modules/.cache/demo-catalog` (behind an HTTPS proxy, add `NODE_USE_ENV_PROXY=1`), trims their
white margin and centres each product on a white card, reads the Magento CSV fixtures for the other
photos, writes every photo at 900 × 1200 plus a 450 × 600 `-sm.webp` copy for phones, and refuses
to write anything if the copy uses a banned word (kurta, pheran, footwear, sales hype, US spelling
and so on). Product slugs come from the titles, so
renaming a product changes its URL. Then run `npm run test:db`, which seeds the demo catalog into a
test database.

## Security model

- Admin identity is Supabase Auth. There are no credentials in the code.
- Admin status is checked server-side by `is_admin_user()` against the `admin_users` allowlist;
  the frontend check is UX only.
- Row Level Security enforces everything at the database: the public can only read active
  catalog rows and settings; all writes require an allow-listed admin.
- Orders are created by the `place_order()` function, which re-checks product availability,
  prices, stock and coupons on the server, and are read back only through `track_order()` with
  the order number and phone. Coupons are never readable by the public.
- Image URLs are sanitised before rendering. Admin search input is stripped of filter operators.
- Netlify sends a strict Content-Security-Policy, `X-Frame-Options: DENY`, HSTS and `nosniff`.
- `robots.txt` keeps `/admin`, `/bag`, `/wishlist` and `/track` out of search engines.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server at http://localhost:5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over `src/` |
| `npm run placeholders` | Regenerate the monochrome site artwork in `public/image/art` |

## Project structure

```
src/
  data/catalog.js        data contract, demo catalog, DB row mappers
  data/demo-products.js  generated demo products (photos in public/image/products)
  context/               ShopContext (catalog, bag, wishlist, orders), AdminContext (session)
  lib/                   supabase client, storefront + admin APIs, catalog utils, WhatsApp, images
  components/ui          buttons, fields, modal, drawer, price, stars, image, seo...
  components/store       header, footer, product card, rails, cart drawer, search overlay
  components/admin       admin layout, tables, image uploader, dialogs
  pages/store            storefront pages
  pages/admin            admin pages
supabase/schema.sql      database schema, security policies, order/coupon/stock functions
supabase/ADMIN-SETUP.md  one-time setup guide
scripts/                 artwork generator and the schema test suite
```
