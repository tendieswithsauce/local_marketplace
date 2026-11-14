-- Blockparty core marketplace schema
--
-- Replaces the hand-built tables (profiles, active_listings, archive_listings,
-- bids, transactions) with a linked schema + RLS. All money is integer cents.
--
-- Access model:
--   anon/authenticated (browser, anon key)  -> constrained by RLS + column grants
--   service_role (Next.js server routes, n8n) -> bypasses RLS; owns payment state
--
-- NOTE: the pre-existing tables held no listings/bids/transactions. The one
-- orphaned profiles row (no matching auth user, plaintext password) is dropped.

-- ---------------------------------------------------------------------------
-- 0. Tear down the old ad-hoc tables
-- ---------------------------------------------------------------------------
drop table if exists public.archive_listings;
drop table if exists public.active_listings;
drop table if exists public.bids;
drop table if exists public.transactions;
drop table if exists public.profiles;

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
-- Keep the existing enum values, but give the types descriptive names and
-- use 'fixed' (what the app uses) instead of 'static'.
alter type public.status rename to listing_status;
alter type public.listing_type rename value 'static' to 'fixed';

create type public.transaction_status as enum (
  'pending',      -- checkout started, not yet paid
  'authorized',   -- card authorized, funds held (manual capture)
  'dropped_off',  -- seller dropped the item at the hub
  'completed',    -- buyer picked up, payment captured
  'canceled',     -- authorization released / checkout abandoned
  'refunded'
);

-- ---------------------------------------------------------------------------
-- 2. Shared helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Hubs (exchange locations)
-- ---------------------------------------------------------------------------
create table public.hubs (
  id         text primary key,                 -- slug, e.g. 'edm-downtown'
  name       text not null unique,
  city       text not null,
  address    text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.hubs (id, name, city) values
  ('edm-downtown', 'Edmonton - Downtown Hub', 'Edmonton'),
  ('edm-west',     'Edmonton - West Hub',     'Edmonton'),
  ('edm-south',    'Edmonton - South Hub',    'Edmonton'),
  ('edm-east',     'Edmonton - East Hub',     'Edmonton');

-- ---------------------------------------------------------------------------
-- 4. Profiles (1:1 with auth.users, created by trigger on sign-up)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                       uuid primary key references auth.users (id) on delete cascade,
  email                    text,                -- mirrored from auth.users for n8n / notifications
  username                 text unique check (username ~ '^[a-zA-Z0-9_]{3,30}$'),
  full_name                text check (char_length(full_name) <= 100),
  phone                    text check (char_length(phone) <= 30),
  address                  jsonb,
  preferred_hub            text references public.hubs (id),
  -- Stripe: buyer side
  stripe_customer_id       text unique,
  stripe_payment_method_id text,
  -- Stripe: seller side (Connect Express account), set by server/webhooks only
  stripe_account_id        text unique,
  stripe_charges_enabled   boolean not null default false,
  stripe_payouts_enabled   boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row whenever someone signs up (email or Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the mirrored email in sync if the user changes it.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------------
-- 5. Listings (one table; lifecycle tracked by status instead of archive copy)
-- ---------------------------------------------------------------------------
create table public.listings (
  id                   bigint generated by default as identity primary key,
  seller_id            uuid not null references public.profiles (id) on delete cascade,
  title                text not null check (char_length(title) between 1 and 120),
  description          text check (char_length(description) <= 5000),
  listing_type         public.listing_type not null,
  status               public.listing_status not null default 'active',
  location_hub         text not null references public.hubs (id),
  image_paths          text[] not null default '{}',  -- object paths in the listing-photos bucket
  buy_now_price_cents  integer check (buy_now_price_cents > 0),
  starting_price_cents integer check (starting_price_cents > 0),
  current_bid_cents    integer,                       -- maintained by place_bid()
  bid_count            integer not null default 0,
  ends_at              timestamptz,
  winning_bid_id       bigint,                        -- FK added after bids exists
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint listings_pricing_by_type check (
    (listing_type = 'fixed'   and buy_now_price_cents is not null and ends_at is null)
    or
    (listing_type = 'auction' and starting_price_cents is not null and ends_at is not null)
  ),
  constraint listings_max_images check (cardinality(image_paths) <= 10)
);

create index listings_status_hub_idx on public.listings (status, location_hub);
create index listings_seller_idx     on public.listings (seller_id);
create index listings_ends_at_idx    on public.listings (ends_at) where listing_type = 'auction' and status = 'active';
create index listings_hub_idx        on public.listings (location_hub);

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. Bids
-- ---------------------------------------------------------------------------
create table public.bids (
  id           bigint generated by default as identity primary key,
  listing_id   bigint not null references public.listings (id) on delete cascade,
  bidder_id    uuid   not null references public.profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  created_at   timestamptz not null default now()
);

create index bids_listing_amount_idx on public.bids (listing_id, amount_cents desc);
create index bids_bidder_idx         on public.bids (bidder_id);

alter table public.listings
  add constraint listings_winning_bid_fk
  foreign key (winning_bid_id) references public.bids (id) on delete set null;
create index listings_winning_bid_idx on public.listings (winning_bid_id);

-- Atomic bid placement. Called from the app via supabase.rpc('place_bid', ...).
create or replace function public.place_bid(p_listing_id bigint, p_amount_cents integer)
returns public.bids
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_listing public.listings;
  v_min     integer;
  v_bid     public.bids;
begin
  if v_uid is null then
    raise exception 'You must be signed in to bid' using errcode = '28000';
  end if;

  select * into v_listing from public.listings where id = p_listing_id for update;

  if not found then
    raise exception 'Listing not found' using errcode = 'P0002';
  end if;
  if v_listing.listing_type <> 'auction' or v_listing.status <> 'active' then
    raise exception 'This listing is not accepting bids' using errcode = 'P0001';
  end if;
  if v_listing.ends_at <= now() then
    raise exception 'This auction has ended' using errcode = 'P0001';
  end if;
  if v_listing.seller_id = v_uid then
    raise exception 'You cannot bid on your own listing' using errcode = 'P0001';
  end if;

  -- First bid must meet the starting price; later bids must beat the current bid by $1.
  v_min := coalesce(v_listing.current_bid_cents + 100, v_listing.starting_price_cents);
  if p_amount_cents < v_min then
    raise exception 'Bid must be at least % cents', v_min using errcode = 'P0001';
  end if;

  insert into public.bids (listing_id, bidder_id, amount_cents)
  values (p_listing_id, v_uid, p_amount_cents)
  returning * into v_bid;

  update public.listings
     set current_bid_cents = p_amount_cents,
         bid_count = bid_count + 1
   where id = p_listing_id;

  return v_bid;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Transactions (written only by server routes / n8n with service_role)
-- ---------------------------------------------------------------------------
create table public.transactions (
  id                         bigint generated by default as identity primary key,
  listing_id                 bigint not null references public.listings (id),
  buyer_id                   uuid   not null references public.profiles (id),
  seller_id                  uuid   not null references public.profiles (id),
  amount_cents               integer not null check (amount_cents > 0),
  platform_fee_cents         integer not null default 0 check (platform_fee_cents >= 0),
  status                     public.transaction_status not null default 'pending',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id   text unique,
  dropoff_code               text,   -- shown to seller only (see get_handoff_code)
  pickup_code                text,   -- shown to buyer only
  dropped_off_at             timestamptz,
  picked_up_at               timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  constraint transactions_buyer_not_seller check (buyer_id <> seller_id)
);

-- Only one live sale per listing.
create unique index transactions_one_live_per_listing
  on public.transactions (listing_id)
  where status not in ('canceled', 'refunded');
create index transactions_buyer_idx  on public.transactions (buyer_id);
create index transactions_seller_idx on public.transactions (seller_id);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- Returns the caller's own handoff code: dropoff code for the seller,
-- pickup code for the buyer. The code columns themselves are not selectable.
create or replace function public.get_handoff_code(p_transaction_id bigint)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
           when t.seller_id = auth.uid() then t.dropoff_code
           when t.buyer_id  = auth.uid() then t.pickup_code
         end
    from public.transactions t
   where t.id = p_transaction_id
     and auth.uid() in (t.buyer_id, t.seller_id);
$$;

-- ---------------------------------------------------------------------------
-- 8. Privileges (column-level) — Supabase grants ALL by default, so reset
-- ---------------------------------------------------------------------------
revoke all on public.hubs, public.profiles, public.listings, public.bids, public.transactions
  from anon, authenticated;

grant select on public.hubs to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (username, full_name, phone, address, preferred_hub)
  on public.profiles to authenticated;

grant select on public.listings to anon, authenticated;
grant insert (seller_id, title, description, listing_type, location_hub, image_paths,
              buy_now_price_cents, starting_price_cents, ends_at)
  on public.listings to authenticated;
grant update (title, description, location_hub, image_paths, buy_now_price_cents, status)
  on public.listings to authenticated;

grant select on public.bids to anon, authenticated;

grant select (id, listing_id, buyer_id, seller_id, amount_cents, platform_fee_cents, status,
              dropped_off_at, picked_up_at, created_at, updated_at)
  on public.transactions to authenticated;

revoke all on function public.place_bid(bigint, integer)   from public, anon;
grant execute on function public.place_bid(bigint, integer) to authenticated;
revoke all on function public.get_handoff_code(bigint)   from public, anon;
grant execute on function public.get_handoff_code(bigint) to authenticated;
revoke all on function public.handle_new_user()          from public, anon, authenticated;
revoke all on function public.handle_user_email_change() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 9. Row level security
-- ---------------------------------------------------------------------------
alter table public.hubs         enable row level security;
alter table public.profiles     enable row level security;
alter table public.listings     enable row level security;
alter table public.bids         enable row level security;
alter table public.transactions enable row level security;

-- hubs: public read
create policy "Hubs are public"
  on public.hubs for select
  to anon, authenticated
  using (is_active);

-- profiles: owner-only. Public seller names will come from a separate
-- public-safe view later, so phone/address/Stripe IDs never leak.
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- listings: active ones are public; sellers see all of theirs; buyers see what they bought
create policy "Active listings are public"
  on public.listings for select
  to anon, authenticated
  using (status = 'active');

create policy "Sellers can view their own listings"
  on public.listings for select
  to authenticated
  using (seller_id = (select auth.uid()));

create policy "Buyers can view listings they purchased"
  on public.listings for select
  to authenticated
  using (exists (
    select 1 from public.transactions t
     where t.listing_id = listings.id and t.buyer_id = (select auth.uid())
  ));

create policy "Sellers can create listings"
  on public.listings for insert
  to authenticated
  with check (
    seller_id = (select auth.uid())
    and (listing_type <> 'auction' or ends_at > now())
  );

-- Sellers may edit or withdraw listings that haven't sold. Sold/pickup/complete
-- states are set by the server (service_role) only.
create policy "Sellers can update unsold listings"
  on public.listings for update
  to authenticated
  using (seller_id = (select auth.uid()) and status in ('active', 'inactive', 'incomplete'))
  with check (seller_id = (select auth.uid()) and status in ('active', 'inactive', 'incomplete'));

-- bids: visible wherever the listing is visible; inserted only via place_bid()
create policy "Bids are visible with their listing"
  on public.bids for select
  to anon, authenticated
  using (exists (select 1 from public.listings l where l.id = bids.listing_id));

-- transactions: buyer and seller can read their own; writes are service_role only
create policy "Parties can view their transactions"
  on public.transactions for select
  to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));

-- ---------------------------------------------------------------------------
-- 10. Storage: public listing-photos bucket, uploads under <user id>/...
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

create policy "Users can upload listing photos to their folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can view their own listing photo objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update their own listing photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own listing photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
