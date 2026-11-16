-- ==========================================================
-- E-COMMERCE SCHEMA — Supabase (Postgres)
-- Jalankan di Supabase SQL Editor
-- ==========================================================

-- Extension untuk UUID
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------
-- 1. PROFILES (role: admin | kasir | customer)
--    id = auth.users.id (1:1)
-- ----------------------------------------------------------
create type user_role as enum ('admin', 'kasir', 'customer');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------
-- 2. CATEGORIES
-- ----------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------
-- 3. PRODUCTS
-- ----------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------
-- 4. ORDERS
--    source: 'online' (pembeli checkout sendiri) | 'pos' (kasir input manual)
--    payment_method diisi oleh Midtrans (qris, bank_transfer, gopay, shopeepay,
--    credit_card, cstore, dsb) atau 'cash' untuk transaksi kasir tunai
-- ----------------------------------------------------------
create type order_status as enum ('pending', 'paid', 'processing', 'completed', 'cancelled', 'expired');
create type order_source as enum ('online', 'pos');

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_code text not null unique,
  customer_id uuid references public.profiles(id),
  cashier_id uuid references public.profiles(id),
  source order_source not null default 'online',
  status order_status not null default 'pending',
  payment_method text,
  midtrans_transaction_id text,
  snap_token text,
  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  shipping_address text,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  price numeric(12,2) not null,
  qty integer not null check (qty > 0),
  subtotal numeric(12,2) not null
);

-- ----------------------------------------------------------
-- 5. TRIGGERS: updated_at otomatis
-- ----------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function set_updated_at();
create trigger trg_products_updated before update on public.products
  for each row execute function set_updated_at();
create trigger trg_orders_updated before update on public.orders
  for each row execute function set_updated_at();

-- ----------------------------------------------------------
-- 6. ROW LEVEL SECURITY
--    Catatan: backend Express menggunakan SERVICE ROLE KEY sehingga
--    RLS di-bypass untuk operasi admin/kasir yang sudah divalidasi
--    oleh middleware JWT+role di sisi server. RLS di bawah ini tetap
--    diaktifkan sebagai lapisan proteksi tambahan jika ada akses
--    langsung dari client memakai anon/public key.
-- ----------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.categories enable row level security;

create policy "profiles: user bisa lihat profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

create policy "products: semua orang bisa lihat produk aktif"
  on public.products for select
  using (is_active = true);

create policy "categories: semua orang bisa lihat"
  on public.categories for select
  using (true);

create policy "orders: customer hanya lihat order miliknya"
  on public.orders for select
  using (auth.uid() = customer_id);

create policy "order_items: ikut aturan order induk"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- 7. SEED: akun admin pertama
--    Buat user admin PERTAMA secara manual lewat Supabase Auth
--    (Authentication > Add User, matikan "auto confirm"=ON / email
--    confirm true), lalu jalankan insert di bawah dengan UID-nya.
--    Contoh:
--    insert into public.profiles (id, full_name, role)
--    values ('<uid-dari-auth-users>', 'Super Admin', 'admin');
-- ----------------------------------------------------------
