-- ملزومات مصرفی — یک‌بار در Supabase → SQL Editor → Run

create table if not exists public.consumable_stock (
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

create index if not exists consumable_stock_date_idx
  on public.consumable_stock (snapshot_date desc, sort_order);

alter table public.consumable_stock enable row level security;

drop policy if exists "consumable_stock_select" on public.consumable_stock;
create policy "consumable_stock_select"
  on public.consumable_stock for select to authenticated using (true);

drop policy if exists "consumable_stock_insert" on public.consumable_stock;
create policy "consumable_stock_insert"
  on public.consumable_stock for insert to authenticated with check (true);

drop policy if exists "consumable_stock_update" on public.consumable_stock;
create policy "consumable_stock_update"
  on public.consumable_stock for update to authenticated using (true) with check (true);

drop policy if exists "consumable_stock_delete" on public.consumable_stock;
create policy "consumable_stock_delete"
  on public.consumable_stock for delete to authenticated using (true);
