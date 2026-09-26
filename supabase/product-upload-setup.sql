create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

insert into public.admin_users (user_id)
values ('93d07705-6396-4555-bec0-d4893fba49bc')
on conflict (user_id) do nothing;

create table if not exists public.products (
  id text primary key,
  sku text not null unique,
  isbn text,
  name text not null,
  slug text not null unique,
  description text not null,
  short_description text not null,
  category_id text not null,
  author text,
  publisher text,
  brand text,
  price numeric(12, 2) not null check (price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5,
  images text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'inactive', 'discontinued')),
  featured boolean not null default false,
  best_seller boolean not null default false,
  new_arrival boolean not null default false,
  rating numeric(2, 1) not null default 5,
  review_count integer not null default 0,
  created_at date not null default current_date,
  updated_at date not null default current_date
);

create table if not exists public.store_packages (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  items jsonb not null default '[]'::jsonb,
  retail_price numeric(12, 2) not null check (retail_price >= 0),
  package_price numeric(12, 2) not null check (package_price >= 0 and package_price <= retail_price),
  available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  order_number text not null unique,
  customer_id text not null default 'guest',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  items jsonb not null,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(12, 2) not null check (total >= 0),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method text not null check (payment_method in ('pay_on_pickup', 'paystack')),
  payment_reference text,
  order_status text not null default 'pending' check (order_status in ('pending', 'payment_pending', 'paid', 'processing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled')),
  delivery_method text not null check (delivery_method in ('pickup', 'delivery')),
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.store_packages enable row level security;
alter table public.orders enable row level security;

grant select on public.admin_users to authenticated;
drop policy if exists "Authenticated users can check own admin access" on public.admin_users;
create policy "Authenticated users can check own admin access"
on public.admin_users for select
to authenticated
using (user_id = (select auth.uid()));

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_current_user_admin() from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.store_packages to anon, authenticated;
grant insert, update, delete on public.store_packages to authenticated;
grant insert on public.orders to anon, authenticated;
grant select, update on public.orders to authenticated;

drop policy if exists "Customers can create pending orders" on public.orders;
create policy "Customers can create pending orders"
on public.orders for insert
to anon, authenticated
with check (payment_status = 'pending' and order_status = 'pending');

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders for select
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Public can read available store packages" on public.store_packages;
create policy "Public can read available store packages"
on public.store_packages for select
to anon
using (available);

drop policy if exists "Authenticated users can read store packages" on public.store_packages;
create policy "Authenticated users can read store packages"
on public.store_packages for select
to authenticated
using (
  available
  or exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

drop policy if exists "Admins can insert store packages" on public.store_packages;
create policy "Admins can insert store packages"
on public.store_packages for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can update store packages" on public.store_packages;
create policy "Admins can update store packages"
on public.store_packages for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can delete store packages" on public.store_packages;
create policy "Admins can delete store packages"
on public.store_packages for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Authenticated users can read products" on public.products;
create policy "Public can read active products"
on public.products for select
to anon
using (status = 'active');

create policy "Authenticated users can read products"
on public.products for select
to authenticated
using (
  status = 'active'
  or exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
)
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);