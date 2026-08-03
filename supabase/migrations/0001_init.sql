-- DrukAgriLink — initial schema
-- UUID ids, created_at/updated_at everywhere, numeric() for money/quantities.
-- Run this in Supabase SQL editor (or via the CLI) before seed.sql.

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type user_role as enum ('farmer','buyer','coordinator','transport');
create type listing_status as enum ('draft','available','partially_allocated','fully_allocated','collected','cancelled');
create type order_status as enum ('draft','open','proposed','confirmed','delivered','completed','cancelled');
create type proposal_status as enum ('draft','pending_farmers','pending_buyer','confirmed','rejected','cancelled');
create type allocation_status as enum ('proposed','accepted','declined');
create type shipment_status as enum ('proposed','assigned','accepted','collecting','in_transit','delivered','cancelled');
create type payment_status as enum ('pending','paid');

-- ---------- helper: updated_at ----------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

-- ---------- profiles ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null,
  phone text,
  dzongkhag text,
  gewog text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- farms ----------
create table farms (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  dzongkhag text not null,
  gewog text not null,
  size_acres numeric(8,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- products (shared catalog) ----------
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  default_unit text not null default 'kg',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- harvest_listings ----------
create table harvest_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references profiles(id) on delete cascade,
  farm_id uuid not null references farms(id) on delete cascade,
  product_id uuid not null references products(id),
  forecast_qty numeric(12,2) not null check (forecast_qty > 0),
  available_qty numeric(12,2) not null check (available_qty >= 0),
  unit text not null default 'kg',
  expected_harvest_date date not null,
  min_price numeric(12,2) not null check (min_price >= 0),
  dzongkhag text not null,
  gewog text not null,
  quality_grade text,
  notes text,
  status listing_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (available_qty <= forecast_qty)
);

-- ---------- buyer_organizations ----------
create table buyer_organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  contact_phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- buyer_orders ----------
create table buyer_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_org_id uuid not null references buyer_organizations(id) on delete cascade,
  product_id uuid not null references products(id),
  required_qty numeric(12,2) not null check (required_qty > 0),
  unit text not null default 'kg',
  offered_price numeric(12,2) not null check (offered_price >= 0),
  required_delivery_date date not null,
  delivery_location text not null,
  min_quality_grade text,
  packaging text,
  notes text,
  status order_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- match_proposals ----------
create table match_proposals (
  id uuid primary key default gen_random_uuid(),
  coordinator_id uuid not null references profiles(id),
  buyer_order_id uuid not null references buyer_orders(id) on delete cascade,
  status proposal_status not null default 'draft',
  explanation text,
  buyer_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- match_allocations (one row per farmer listing in a proposal) ----------
create table match_allocations (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references match_proposals(id) on delete cascade,
  listing_id uuid not null references harvest_listings(id),
  farmer_id uuid not null references profiles(id),
  allocated_qty numeric(12,2) not null check (allocated_qty > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  status allocation_status not null default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- vehicles ----------
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references profiles(id) on delete cascade,
  registration_no text not null,
  vehicle_type text not null,
  capacity_kg numeric(10,2) not null check (capacity_kg > 0),
  refrigerated boolean not null default false,
  service_area text,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- shipments ----------
create table shipments (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references match_proposals(id) on delete cascade,
  vehicle_id uuid references vehicles(id),
  provider_id uuid references profiles(id),
  collection_date date,
  delivery_date date,
  collection_location text,
  delivery_location text,
  driver_name text,
  driver_phone text,
  status shipment_status not null default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- collection_records ----------
create table collection_records (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references shipments(id) on delete cascade,
  allocation_id uuid not null references match_allocations(id),
  farmer_id uuid not null references profiles(id),
  product_id uuid not null references products(id),
  expected_qty numeric(12,2) not null default 0,
  presented_qty numeric(12,2) not null default 0,
  accepted_qty numeric(12,2) not null default 0,
  rejected_qty numeric(12,2) not null default 0,
  unit_price numeric(12,2) not null default 0,
  transport_deduction numeric(12,2) not null default 0,
  other_deduction numeric(12,2) not null default 0,
  net_amount_due numeric(14,2) not null default 0,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- payment_records ----------
create table payment_records (
  id uuid primary key default gen_random_uuid(),
  collection_record_id uuid not null references collection_records(id) on delete cascade,
  farmer_id uuid not null references profiles(id),
  amount numeric(14,2) not null,
  status payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- notifications ----------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','farms','products','harvest_listings','buyer_organizations',
    'buyer_orders','match_proposals','match_allocations','vehicles','shipments',
    'collection_records','payment_records','notifications'
  ] loop
    execute format(
      'create trigger trg_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ===================================================================
-- Row Level Security
-- ===================================================================
alter table profiles enable row level security;
alter table farms enable row level security;
alter table products enable row level security;
alter table harvest_listings enable row level security;
alter table buyer_organizations enable row level security;
alter table buyer_orders enable row level security;
alter table match_proposals enable row level security;
alter table match_allocations enable row level security;
alter table vehicles enable row level security;
alter table shipments enable row level security;
alter table collection_records enable row level security;
alter table payment_records enable row level security;
alter table notifications enable row level security;

create or replace function my_role() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- profiles: read own; coordinators read all (needed to show supply/demand names)
create policy profiles_self_read on profiles for select
  using (id = auth.uid() or my_role() = 'coordinator');
create policy profiles_self_write on profiles for update using (id = auth.uid());
create policy profiles_insert on profiles for insert with check (id = auth.uid());

-- products: everyone signed-in can read; only coordinators manage
create policy products_read on products for select using (auth.uid() is not null);
create policy products_write on products for all
  using (my_role() = 'coordinator') with check (my_role() = 'coordinator');

-- farms: owner full access; coordinator read
create policy farms_owner on farms for all
  using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());
create policy farms_coord_read on farms for select using (my_role() = 'coordinator');

-- harvest_listings: farmer owns own; coordinator reads all; buyers read 'available'
create policy listings_owner on harvest_listings for all
  using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());
create policy listings_coord_read on harvest_listings for select using (my_role() = 'coordinator');
create policy listings_buyer_read on harvest_listings for select
  using (my_role() = 'buyer' and status = 'available');

-- buyer_organizations: owner full; coordinator read
create policy orgs_owner on buyer_organizations for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy orgs_coord_read on buyer_organizations for select using (my_role() = 'coordinator');

-- buyer_orders: buyer restricted to own org; coordinator reads all
create policy orders_owner on buyer_orders for all
  using (buyer_org_id in (select id from buyer_organizations where owner_id = auth.uid()))
  with check (buyer_org_id in (select id from buyer_organizations where owner_id = auth.uid()));
create policy orders_coord_read on buyer_orders for select using (my_role() = 'coordinator');

-- match_proposals: coordinator manages; buyer/farmer read proposals that involve them
create policy proposals_coord on match_proposals for all
  using (my_role() = 'coordinator') with check (my_role() = 'coordinator');
create policy proposals_buyer_read on match_proposals for select using (
  buyer_order_id in (
    select o.id from buyer_orders o
    join buyer_organizations org on org.id = o.buyer_org_id
    where org.owner_id = auth.uid())
);
create policy proposals_buyer_approve on match_proposals for update using (
  buyer_order_id in (
    select o.id from buyer_orders o
    join buyer_organizations org on org.id = o.buyer_org_id
    where org.owner_id = auth.uid())
);
create policy proposals_farmer_read on match_proposals for select using (
  id in (select proposal_id from match_allocations where farmer_id = auth.uid())
);

-- match_allocations: coordinator manages; farmer reads/updates own (accept/decline)
create policy alloc_coord on match_allocations for all
  using (my_role() = 'coordinator') with check (my_role() = 'coordinator');
create policy alloc_farmer_read on match_allocations for select using (farmer_id = auth.uid());
create policy alloc_farmer_update on match_allocations for update using (farmer_id = auth.uid());

-- vehicles: provider owns; coordinator reads
create policy vehicles_owner on vehicles for all
  using (provider_id = auth.uid()) with check (provider_id = auth.uid());
create policy vehicles_coord_read on vehicles for select using (my_role() = 'coordinator');

-- shipments: coordinator manages; assigned provider reads/updates
create policy shipments_coord on shipments for all
  using (my_role() = 'coordinator') with check (my_role() = 'coordinator');
create policy shipments_provider_read on shipments for select using (provider_id = auth.uid());
create policy shipments_provider_update on shipments for update using (provider_id = auth.uid());

-- collection_records: coordinator manages; farmer reads own
create policy collections_coord on collection_records for all
  using (my_role() = 'coordinator') with check (my_role() = 'coordinator');
create policy collections_farmer_read on collection_records for select using (farmer_id = auth.uid());

-- payment_records: coordinator manages; farmer reads own
create policy payments_coord on payment_records for all
  using (my_role() = 'coordinator') with check (my_role() = 'coordinator');
create policy payments_farmer_read on payment_records for select using (farmer_id = auth.uid());

-- notifications: user reads/updates own
create policy notif_own on notifications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
