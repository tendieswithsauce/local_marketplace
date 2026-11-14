-- Cover the profiles.preferred_hub foreign key (Supabase performance advisor).
create index if not exists profiles_preferred_hub_idx on public.profiles (preferred_hub);
