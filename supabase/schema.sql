-- ═══════════════════════════════════════════════════════════════════
-- Al Habib Garments Mall — Supabase schema
-- Run this WHOLE file once in: Supabase Dashboard -> SQL Editor -> New query
-- It is safe to re-run (everything is idempotent).
--
-- Security model:
--   * admin_users holds the emails allowed into the admin dashboard.
--   * is_admin_user() checks the CURRENT authenticated user against it
--     (SECURITY DEFINER, so the table itself stays unreadable to clients).
--   * Row Level Security enforces everything at the database level:
--       - anyone (even logged out) can READ active catalog rows + settings
--       - only admins can INSERT / UPDATE / DELETE catalog rows
--       - orders are written through place_order() and read back through
--         track_order() (order number + phone); the table itself is admin-only
--       - coupons are never readable by the public; validate_coupon() answers
--     So even if someone tampers with the frontend, the DB refuses writes.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Admin allowlist ────────────────────────────────────────────
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- No policies on purpose: clients can never read or write this table.

-- ►► PUT THE ADMIN EMAIL ADDRESSES HERE (one line each) ◄◄
-- Replace the placeholder with the Gmail / email address you will sign in with.
-- To add another admin later, run one more insert like this.
insert into public.admin_users (email) values
  ('owner@example.com')
on conflict (email) do nothing;

create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $fn$
  select exists (
    select 1 from public.admin_users a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$fn$;

-- Lets the login page check "is this email allowed?" BEFORE sending a code,
-- so random visitors never trigger an email or create a junk auth account.
create or replace function public.is_admin_email(check_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $fn$
  select exists (
    select 1 from public.admin_users a
    where lower(a.email) = lower(trim(coalesce(check_email, '')))
  );
$fn$;

revoke all on function public.is_admin_email(text) from public;
grant execute on function public.is_admin_email(text) to anon, authenticated;
revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to anon, authenticated;

-- ── 2. Shared helpers ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

-- ── 3. Categories ─────────────────────────────────────────────────
create table if not exists public.categories (
  key text primary key,
  department text not null check (department in ('men', 'women', 'kids', 'accessories')),
  slug text not null,
  name text not null,
  size_set text not null default 'apparel' check (size_set in ('apparel', 'waist', 'kids', 'footwear', 'free')),
  description text not null default '',
  image_url text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department, slug)
);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories for select using (is_active = true or public.is_admin_user());
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

-- ── 4. Products ───────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  brand text not null default 'Al Habib',
  department text not null default 'men' check (department in ('men', 'women', 'kids', 'accessories')),
  category_key text references public.categories (key) on update cascade on delete restrict,
  badge text not null default '',
  short_info text not null default '',
  description text not null default '',
  details jsonb not null default '{}'::jsonb,
  mrp integer not null default 0 check (mrp >= 0),
  price integer not null default 0 check (price >= 0),
  size_set text not null default 'apparel' check (size_set in ('apparel', 'waist', 'kids', 'footwear', 'free')),
  sizes jsonb not null default '[]'::jsonb,      -- ["S","M","L"]
  variants jsonb not null default '[]'::jsonb,   -- [{"color":"Black","hex":"#111","images":[...],"stock":{"S":3,"M":0}}]
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_sort_idx on public.products (sort_order, created_at desc);
create index if not exists products_active_idx on public.products (is_active);
create index if not exists products_department_idx on public.products (department);
create index if not exists products_category_idx on public.products (category_key);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();

alter table public.products enable row level security;
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (is_active = true or public.is_admin_user());
drop policy if exists "admin insert products" on public.products;
create policy "admin insert products" on public.products for insert to authenticated with check (public.is_admin_user());
drop policy if exists "admin update products" on public.products;
create policy "admin update products" on public.products for update to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "admin delete products" on public.products;
create policy "admin delete products" on public.products for delete to authenticated using (public.is_admin_user());

-- ── 5. Reviews (public submit, admin approve) ─────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  product_slug text not null default '',
  name text not null check (char_length(name) between 1 and 60),
  rating integer not null check (rating between 1 and 5),
  title text not null default '' check (char_length(title) <= 120),
  body text not null default '' check (char_length(body) <= 1200),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on public.reviews (product_id, is_approved);

alter table public.reviews enable row level security;
drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews" on public.reviews for select using (is_approved = true or public.is_admin_user());
drop policy if exists "public submit reviews" on public.reviews;
create policy "public submit reviews" on public.reviews for insert to anon, authenticated with check (is_approved = false);
drop policy if exists "admin update reviews" on public.reviews;
create policy "admin update reviews" on public.reviews for update to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "admin delete reviews" on public.reviews;
create policy "admin delete reviews" on public.reviews for delete to authenticated using (public.is_admin_user());

-- Aggregated ratings for product cards (only approved rows are visible through RLS).
create or replace view public.product_ratings
with (security_invoker = true) as
  select product_id, round(avg(rating)::numeric, 1) as average, count(*)::integer as count
  from public.reviews
  where is_approved = true
  group by product_id;
grant select on public.product_ratings to anon, authenticated;

-- ── 6. Banners, collections, size guides ──────────────────────────
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null default 'hero' check (placement in ('hero', 'strip')),
  title text not null default '',
  subtitle text not null default '',
  cta_label text not null default '',
  cta_link text not null default '',
  image_url text not null default '',
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists banners_set_updated_at on public.banners;
create trigger banners_set_updated_at before update on public.banners for each row execute function public.set_updated_at();
alter table public.banners enable row level security;
drop policy if exists "public read active banners" on public.banners;
create policy "public read active banners" on public.banners for select using (is_active = true or public.is_admin_user());
drop policy if exists "admin write banners" on public.banners;
create policy "admin write banners" on public.banners for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  image_url text not null default '',
  product_slugs text[] not null default '{}',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at before update on public.collections for each row execute function public.set_updated_at();
alter table public.collections enable row level security;
drop policy if exists "public read active collections" on public.collections;
create policy "public read active collections" on public.collections for select using (is_active = true or public.is_admin_user());
drop policy if exists "admin write collections" on public.collections;
create policy "admin write collections" on public.collections for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

create table if not exists public.size_guides (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  applies_to jsonb not null default '{"departments":[],"sizeSets":[]}'::jsonb,
  columns jsonb not null default '[]'::jsonb,
  rows jsonb not null default '[]'::jsonb,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists size_guides_set_updated_at on public.size_guides;
create trigger size_guides_set_updated_at before update on public.size_guides for each row execute function public.set_updated_at();
alter table public.size_guides enable row level security;
drop policy if exists "public read size guides" on public.size_guides;
create policy "public read size guides" on public.size_guides for select using (true);
drop policy if exists "admin write size guides" on public.size_guides;
create policy "admin write size guides" on public.size_guides for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

-- ── 7. Coupons (never readable by the public) ─────────────────────
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code = upper(code) and char_length(code) between 3 and 24),
  type text not null default 'percent' check (type in ('percent', 'flat')),
  value integer not null check (value > 0),
  min_order integer not null default 0 check (min_order >= 0),
  max_discount integer check (max_discount is null or max_discount > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists coupons_set_updated_at on public.coupons;
create trigger coupons_set_updated_at before update on public.coupons for each row execute function public.set_updated_at();
alter table public.coupons enable row level security;
drop policy if exists "admin manage coupons" on public.coupons;
create policy "admin manage coupons" on public.coupons for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

create or replace function public.validate_coupon(p_code text, p_subtotal integer)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $fn$
declare
  c public.coupons%rowtype;
  d integer;
begin
  select * into c from public.coupons where code = upper(trim(coalesce(p_code, '')));
  if not found then
    return jsonb_build_object('valid', false, 'discount', 0, 'message', 'Coupon not found.');
  end if;
  if not c.is_active then
    return jsonb_build_object('valid', false, 'discount', 0, 'message', 'This coupon is no longer active.');
  end if;
  if c.starts_at is not null and c.starts_at > now() then
    return jsonb_build_object('valid', false, 'discount', 0, 'message', 'This coupon is not active yet.');
  end if;
  if c.expires_at is not null and c.expires_at < now() then
    return jsonb_build_object('valid', false, 'discount', 0, 'message', 'This coupon has expired.');
  end if;
  if c.usage_limit is not null and c.used_count >= c.usage_limit then
    return jsonb_build_object('valid', false, 'discount', 0, 'message', 'This coupon has been fully redeemed.');
  end if;
  if coalesce(p_subtotal, 0) < c.min_order then
    return jsonb_build_object('valid', false, 'discount', 0, 'message', format('Add items worth ₹%s more to use this coupon.', c.min_order - coalesce(p_subtotal, 0)));
  end if;
  d := case when c.type = 'flat' then c.value else floor(coalesce(p_subtotal, 0) * c.value / 100.0)::integer end;
  if c.max_discount is not null then d := least(d, c.max_discount); end if;
  d := greatest(0, least(d, coalesce(p_subtotal, 0)));
  return jsonb_build_object(
    'valid', d > 0,
    'discount', d,
    'message', case when d > 0 then format('Coupon applied. You save ₹%s.', d) else 'This coupon gives no discount on this bag.' end,
    'type', c.type,
    'value', c.value
  );
end;
$fn$;
revoke all on function public.validate_coupon(text, integer) from public;
grant execute on function public.validate_coupon(text, integer) to anon, authenticated;

-- ── 8. Store settings (single row, id = 1) ────────────────────────
create table if not exists public.store_settings (
  id integer primary key check (id = 1),
  store_name text not null default 'Al Habib Garments Mall',
  tagline text not null default 'Kunzer, Tangmarg',
  whatsapp_number text not null default '919622553899',
  phone_display text not null default '+91 96225 53899',
  email text not null default '',
  address text not null default 'Main Market, Kunzer, Tangmarg, Baramulla, Jammu & Kashmir',
  maps_query text not null default 'Al Habib Garments Mall, Kunzer, Tangmarg',
  hours text not null default 'Open every day, 10:00 AM to 8:00 PM',
  instagram text not null default 'alhabibgarments',
  facebook text not null default 'https://www.facebook.com/alhabibgm/',
  delivery_fee integer not null default 99 check (delivery_fee >= 0),
  free_delivery_over integer not null default 1999 check (free_delivery_over >= 0),
  cod_enabled boolean not null default true,
  delivery_note text not null default 'Dispatched within 24 hours. 2 to 4 days across Jammu & Kashmir, 5 to 8 days across India.',
  return_days integer not null default 7 check (return_days >= 0),
  announcement_text text not null default 'Free delivery from ₹1,999 · Order directly on WhatsApp',
  announcement_enabled boolean not null default true,
  about text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;
drop trigger if exists settings_set_updated_at on public.store_settings;
create trigger settings_set_updated_at before update on public.store_settings for each row execute function public.set_updated_at();
alter table public.store_settings enable row level security;
drop policy if exists "public read settings" on public.store_settings;
create policy "public read settings" on public.store_settings for select using (true);
drop policy if exists "admin write settings" on public.store_settings;
create policy "admin write settings" on public.store_settings for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

-- ── 9. Orders ─────────────────────────────────────────────────────
create sequence if not exists public.order_number_seq start with 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  status text not null default 'new' check (status in ('new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  customer_name text not null,
  phone text not null,
  address text not null default '',
  city text not null default '',
  pincode text not null default '',
  note text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  discount integer not null default 0,
  coupon_code text not null default '',
  delivery_fee integer not null default 0,
  total integer not null default 0,
  stock_applied boolean not null default false,
  status_history jsonb not null default '[]'::jsonb,
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_phone_idx on public.orders (phone);
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
-- No public policies: customers write through place_order() and read through track_order().
drop policy if exists "admin manage orders" on public.orders;
create policy "admin manage orders" on public.orders for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

-- Places an order. Prices, stock and coupon are all re-checked server-side.
create or replace function public.place_order(p_customer jsonb, p_items jsonb, p_coupon text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_name text := left(trim(coalesce(p_customer ->> 'name', '')), 80);
  v_phone text := regexp_replace(coalesce(p_customer ->> 'phone', ''), '\D', '', 'g');
  v_address text := left(trim(coalesce(p_customer ->> 'address', '')), 300);
  v_city text := left(trim(coalesce(p_customer ->> 'city', '')), 80);
  v_pincode text := regexp_replace(coalesce(p_customer ->> 'pincode', ''), '\D', '', 'g');
  v_note text := left(trim(coalesce(p_customer ->> 'note', '')), 500);
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant jsonb;
  v_color text;
  v_size text;
  v_qty integer;
  v_stock integer;
  v_lines jsonb := '[]'::jsonb;
  v_subtotal integer := 0;
  v_count integer := 0;
  v_discount integer := 0;
  v_coupon_code text := '';
  v_coupon jsonb;
  v_settings public.store_settings%rowtype;
  v_fee integer := 0;
  v_total integer;
  v_number text;
  v_order public.orders%rowtype;
begin
  if char_length(v_name) < 2 then
    raise exception 'Please enter your name.';
  end if;
  if v_phone ~ '^0[6-9]\d{9}$' then v_phone := substr(v_phone, 2); end if;
  if v_phone ~ '^91[6-9]\d{9}$' then v_phone := substr(v_phone, 3); end if;
  if v_phone !~ '^[6-9]\d{9}$' then
    raise exception 'Please enter a valid 10-digit mobile number.';
  end if;
  if char_length(v_address) < 6 then
    raise exception 'Please enter your delivery address.';
  end if;
  if v_pincode <> '' and v_pincode !~ '^[1-9]\d{5}$' then
    raise exception 'Please enter a valid 6-digit PIN code.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty.';
  end if;
  if jsonb_array_length(p_items) > 30 then
    raise exception 'Too many items in one order. Please split it.';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if coalesce(v_item ->> 'product_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'One of the items is invalid. Please refresh and try again.';
    end if;
    v_color := coalesce(v_item ->> 'color', '');
    v_size := coalesce(v_item ->> 'size', '');
    v_qty := coalesce(nullif(v_item ->> 'qty', '')::integer, 0);
    if v_qty < 1 or v_qty > 10 then
      raise exception 'Quantity must be between 1 and 10 per item.';
    end if;
    select * into v_product from public.products where id = (v_item ->> 'product_id')::uuid and is_active = true;
    if not found then
      raise exception 'One of the items is no longer available.';
    end if;
    select v.value into v_variant from jsonb_array_elements(v_product.variants) v where v.value ->> 'color' = v_color limit 1;
    if v_variant is null then
      raise exception '% is not available in %.', v_product.title, v_color;
    end if;
    v_stock := coalesce(nullif(v_variant -> 'stock' ->> v_size, '')::integer, 0);
    if v_stock < v_qty then
      raise exception 'Only % left of % (% / %).', v_stock, v_product.title, v_color, v_size;
    end if;
    v_subtotal := v_subtotal + v_product.price * v_qty;
    v_count := v_count + v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id, 'slug', v_product.slug, 'title', v_product.title,
      'color', v_color, 'size', v_size, 'qty', v_qty, 'price', v_product.price, 'mrp', v_product.mrp,
      'image', coalesce(v_variant -> 'images' ->> 0, '')
    );
  end loop;

  if p_coupon is not null and trim(p_coupon) <> '' then
    v_coupon := public.validate_coupon(p_coupon, v_subtotal);
    if (v_coupon ->> 'valid')::boolean then
      v_discount := (v_coupon ->> 'discount')::integer;
      v_coupon_code := upper(trim(p_coupon));
      update public.coupons set used_count = used_count + 1 where code = v_coupon_code;
    end if;
  end if;

  select * into v_settings from public.store_settings where id = 1;
  v_fee := coalesce(v_settings.delivery_fee, 0);
  if coalesce(v_settings.free_delivery_over, 0) > 0 and (v_subtotal - v_discount) >= v_settings.free_delivery_over then
    v_fee := 0;
  end if;
  v_total := v_subtotal - v_discount + v_fee;
  v_number := 'AHG-' || lpad(nextval('public.order_number_seq')::text, 5, '0');

  insert into public.orders (order_number, customer_name, phone, address, city, pincode, note, items, subtotal, discount, coupon_code, delivery_fee, total, status, status_history)
  values (v_number, v_name, v_phone, v_address, v_city, v_pincode, v_note, v_lines, v_subtotal, v_discount, v_coupon_code, v_fee, v_total, 'new',
          jsonb_build_array(jsonb_build_object('status', 'new', 'at', now())))
  returning * into v_order;

  return jsonb_build_object(
    'id', v_order.id, 'order_number', v_order.order_number, 'subtotal', v_subtotal, 'discount', v_discount,
    'delivery_fee', v_fee, 'total', v_total, 'items', v_lines, 'item_count', v_count, 'created_at', v_order.created_at
  );
end;
$fn$;
revoke all on function public.place_order(jsonb, jsonb, text) from public;
grant execute on function public.place_order(jsonb, jsonb, text) to anon, authenticated;

-- Customers look up their own order with the order number + the phone used.
create or replace function public.track_order(p_order_number text, p_phone text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $fn$
  select jsonb_build_object(
    'order_number', o.order_number, 'status', o.status, 'items', o.items, 'subtotal', o.subtotal, 'discount', o.discount,
    'coupon_code', o.coupon_code, 'delivery_fee', o.delivery_fee, 'total', o.total, 'created_at', o.created_at,
    'updated_at', o.updated_at, 'status_history', o.status_history, 'customer_name', o.customer_name, 'city', o.city
  )
  from public.orders o
  where o.order_number = upper(trim(coalesce(p_order_number, '')))
    and right(o.phone, 10) = right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10)
    and char_length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) >= 10
  limit 1;
$fn$;
revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- Adjusts one size of one colour variant inside products.variants (internal helper).
create or replace function public.adjust_variant_stock(p_product_id uuid, p_color text, p_size text, p_delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  update public.products p
  set variants = coalesce((
    select jsonb_agg(
      case when t.v ->> 'color' = p_color
        then t.v || jsonb_build_object('stock', jsonb_set(coalesce(t.v -> 'stock', '{}'::jsonb), array[p_size], to_jsonb(greatest(0, coalesce(nullif(t.v -> 'stock' ->> p_size, '')::integer, 0) + p_delta)), true))
        else t.v end
      order by t.ord)
    from jsonb_array_elements(p.variants) with ordinality as t(v, ord)
  ), p.variants)
  where p.id = p_product_id;
end;
$fn$;
revoke all on function public.adjust_variant_stock(uuid, text, text, integer) from public, anon, authenticated;

-- Admin changes an order's status. Moving to confirmed/packed/shipped/delivered
-- reserves stock once; moving to new/cancelled releases it.
create or replace function public.set_order_status(p_order_id uuid, p_status text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $fn$
declare
  o public.orders%rowtype;
  it jsonb;
  v_apply boolean;
  v_release boolean;
begin
  if not public.is_admin_user() then
    raise exception 'Not allowed.';
  end if;
  if p_status not in ('new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Unknown status %.', p_status;
  end if;
  select * into o from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found.';
  end if;
  v_apply := p_status in ('confirmed', 'packed', 'shipped', 'delivered') and not o.stock_applied;
  v_release := p_status in ('new', 'cancelled') and o.stock_applied;
  if v_apply then
    for it in select value from jsonb_array_elements(o.items) loop
      perform public.adjust_variant_stock((it ->> 'product_id')::uuid, it ->> 'color', it ->> 'size', -(coalesce(nullif(it ->> 'qty', '')::integer, 0)));
    end loop;
  elsif v_release then
    for it in select value from jsonb_array_elements(o.items) loop
      perform public.adjust_variant_stock((it ->> 'product_id')::uuid, it ->> 'color', it ->> 'size', coalesce(nullif(it ->> 'qty', '')::integer, 0));
    end loop;
  end if;
  update public.orders
  set status = p_status,
      stock_applied = case when v_apply then true when v_release then false else stock_applied end,
      status_history = coalesce(status_history, '[]'::jsonb) || jsonb_build_object('status', p_status, 'at', now())
  where id = p_order_id
  returning * into o;
  return o;
end;
$fn$;
revoke all on function public.set_order_status(uuid, text) from public, anon;
grant execute on function public.set_order_status(uuid, text) to authenticated;

-- ── 10. Image storage (products, banners, collections, categories) ─
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 8388608,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin_user());
drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin_user());
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin_user());

-- ═══════════════════════════════════════════════════════════════════
-- DONE. Verify with:
--     select email from public.admin_users;
--
-- Then sign in at /admin/login with a 6-digit email code (or a password
-- you set in Supabase -> Authentication -> Users) and click
-- "Import dummy catalog" on the dashboard to start from the built-in data.
-- ═══════════════════════════════════════════════════════════════════
