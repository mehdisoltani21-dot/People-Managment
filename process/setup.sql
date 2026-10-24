-- جدول «مدیریت وقایع فرآیندی» — این فایل را یک بار در Supabase → SQL Editor اجرا کنید
-- دسترسی: همه کاربران واردشده ثبت و مشاهده؛ فقط مدیران (role = 'admin') ویرایش و حذف

create table if not exists public.process_events (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  workstation text not null,
  process_type text not null,
  quantity numeric,
  operator1_id text, operator1_name text,
  operator2_id text, operator2_name text,
  operator3_id text, operator3_name text,
  operator4_id text, operator4_name text,
  description text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_by_name text,
  created_at timestamptz not null default now()
);

alter table public.process_events enable row level security;

drop policy if exists "process_select_authenticated" on public.process_events;
create policy "process_select_authenticated"
  on public.process_events for select to authenticated using (true);

drop policy if exists "process_insert_authenticated" on public.process_events;
create policy "process_insert_authenticated"
  on public.process_events for insert to authenticated
  with check (
    exists (select 1 from public.user_profiles p
            where p.id = auth.uid() and p.role in ('admin','operator'))
  );

drop policy if exists "process_update_admin" on public.process_events;
create policy "process_update_admin"
  on public.process_events for update to authenticated
  using (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "process_delete_admin" on public.process_events;
create policy "process_delete_admin"
  on public.process_events for delete to authenticated
  using (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'));

create index if not exists process_events_created_at_idx on public.process_events (created_at desc);
