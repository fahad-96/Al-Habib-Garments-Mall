# Admin dashboard — one-time setup

The storefront works the moment it is deployed. The admin dashboard, the live catalog,
saved orders, coupons and reviews switch on once the site is connected to a free
[Supabase](https://supabase.com) project. This takes about fifteen minutes.

## 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) and click **New project**.
2. Pick any name (for example `al-habib-garments`), choose the **Mumbai** region, set a strong
   database password and save it somewhere safe. You will not need it again for this site.

## 2. Create the database

1. In the Supabase dashboard open **SQL Editor → New query**.
2. Open [`schema.sql`](./schema.sql), find the block marked **PUT THE ADMIN EMAIL ADDRESSES HERE**
   and replace `owner@example.com` with the email address you will sign in with. Add one line per
   admin.
3. Paste the whole file into the editor and click **Run**. It creates every table, the security
   rules, the order and coupon functions and the image bucket. It is safe to run again later.

Verify with:

```sql
select email from public.admin_users;
```

## 3. Auth settings

Supabase → **Authentication → URL Configuration**

- **Site URL**: your live site, for example `https://alhabibgarments.netlify.app`
- **Redirect URLs**: add both
  - `https://alhabibgarments.netlify.app/admin/login`
  - `http://localhost:5173/admin/login`

Supabase → **Authentication → Emails → Magic Link**: replace the template body with the one
below so the email contains the 6-digit code the login page asks for.

```html
<h2>Al Habib Garments Mall — Admin login</h2>
<p>Your login code is:</p>
<p style="font-size:32px;font-weight:bold;letter-spacing:8px">{{ .Token }}</p>
<p>This code expires in 1 hour.</p>
<p>Or click here to sign in: <a href="{{ .ConfirmationURL }}">Open the admin dashboard</a></p>
<p style="color:#888;font-size:12px">If you did not request this, ignore this email.</p>
```

Optional but recommended: set a password too, because Supabase's built-in email service is
rate-limited on the free tier. Supabase → **Authentication → Users → Add user**, enter the admin
email and a strong password, keep **Auto Confirm User** ticked. The login page has a
**Password** tab.

After every admin has signed in once, close the door: **Authentication → Sign In / Providers →
Email → Allow new users to sign up: off**. Existing admins keep working.

## 4. Connect the site

Supabase → **Project Settings → API Keys**. Copy the **Project URL** and the **publishable**
(anon) key.

- **Locally**: copy `.env.example` to `.env`, paste both values, restart `npm run dev`.
- **Netlify**: Site configuration → **Environment variables** → add
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then **Deploys → Trigger deploy → Clear cache
  and deploy site**. Vite inlines these at build time, so a redeploy is required.

## 5. First login

Open `/admin/login`, sign in, and click **Import demo catalog** on the dashboard. That copies the
built-in categories, products, banners, collections and size guides into the database so you can
edit prices, upload real photos, and delete what you do not sell. Once the database has at least
one product, the live catalog replaces the built-in one on the storefront.

## Security summary

- `admin_users` has RLS on and no policies, so no client can ever read or change the allowlist.
- `is_admin_user()` is `SECURITY DEFINER` and compares the signed-in email against the allowlist.
- Public visitors can only read active catalog rows and settings. All writes require an admin.
- Orders are created by `place_order()`, which re-checks prices, stock and coupons on the server,
  and are read back only by `track_order()` with the order number and phone number.
- Coupons are never readable by the public; `validate_coupon()` answers yes or no.
- The publishable key in the frontend is meant to be public. It grants nothing beyond the policies.
- The **service_role** key and the database password must never appear in this repository or in
  any `VITE_*` variable.
