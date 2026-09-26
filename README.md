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

The site runs on the built-in demo catalog of 128 products with real product photography. The admin stays disabled until
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

The demo catalog ships with open-source product photography (Magento Luma sample data under
OSL 3.0 and Sylius fixtures under MIT; see `public/image/ATTRIBUTIONS.md`) so the store looks
complete out of the box. Upload your own photos from the admin product editor, on a phone or a
laptop; they are compressed to WebP in the browser and stored in Supabase Storage.

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
