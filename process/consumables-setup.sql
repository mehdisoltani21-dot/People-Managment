-- ملزومات مصرفی — در Supabase → SQL Editor اجرا کنید

create table if not exists public.consumable_inventory (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  item_name text not null,
  quantity numeric,
  unit text,
  note text,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_by_name text,
  created_at timestamptz not null default now()
);

create index if not exists consumable_inventory_date_idx
  on public.consumable_inventory (snapshot_date desc, sort_order);

alter table public.consumable_inventory enable row level security;

drop policy if exists "consumable_select_authenticated" on public.consumable_inventory;
create policy "consumable_select_authenticated"
  on public.consumable_inventory for select to authenticated using (true);

drop policy if exists "consumable_insert_authenticated" on public.consumable_inventory;
create policy "consumable_insert_authenticated"
  on public.consumable_inventory for insert to authenticated with check (true);

drop policy if exists "consumable_delete_authenticated" on public.consumable_inventory;
create policy "consumable_delete_authenticated"
  on public.consumable_inventory for delete to authenticated using (true);

drop policy if exists "consumable_update_authenticated" on public.consumable_inventory;
create policy "consumable_update_authenticated"
  on public.consumable_inventory for update to authenticated using (true) with check (true);
