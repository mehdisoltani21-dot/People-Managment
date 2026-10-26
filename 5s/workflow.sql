-- اختیاری: ستون وضعیت گردش‌کار 5S
-- در Supabase → SQL Editor اجرا کنید (اجباری نیست؛ وضعیت داخل details هم ذخیره می‌شود)

alter table public.five_s_audits
  add column if not exists workflow_status text default 'submitted';

alter table public.five_s_audits
  add column if not exists soltani_reviewed_at timestamptz;

alter table public.five_s_audits
  add column if not exists kazemi_finalized_at timestamptz;

comment on column public.five_s_audits.workflow_status is
  'submitted | soltani_reviewed | finalized';
