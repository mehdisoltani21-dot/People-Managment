-- جدول گزارش‌های 5S
-- این کد را در Supabase → SQL Editor اجرا کنید

create table if not exists public.five_s_audits (
  id uuid primary key default gen_random_uuid(),
  audit_date date,
  area text,
  auditor text,
  operator_id text,
  operator_name text,
  assistant1_id text,
  assistant1_name text,
  assistant2_id text,
  assistant2_name text,
  assistant3_id text,
  assistant3_name text,
  total_score integer not null default 0,
  max_score integer not null default 0,
  details jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_by_name text,
  created_at timestamptz not null default now()
);

alter table public.five_s_audits enable row level security;

-- همه کاربران واردشده می‌توانند ببینند و ثبت کنند
drop policy if exists "five_s_select_authenticated" on public.five_s_audits;
create policy "five_s_select_authenticated"
  on public.five_s_audits for select
  to authenticated
  using (true);

drop policy if exists "five_s_insert_authenticated" on public.five_s_audits;
create policy "five_s_insert_authenticated"
  on public.five_s_audits for insert
  to authenticated
  with check (true);

-- فقط مدیر می‌تواند حذف کند (نقش در user_profiles)
drop policy if exists "five_s_delete_admin" on public.five_s_audits;
create policy "five_s_delete_admin"
  on public.five_s_audits for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create index if not exists five_s_audits_created_at_idx on public.five_s_audits (created_at desc);
create index if not exists five_s_audits_audit_date_idx on public.five_s_audits (audit_date desc);
