-- یک‌بار در Supabase → SQL Editor → Run
-- زمان شروع/پایان + اطمینان از وجود description

alter table public.process_events
  add column if not exists description text;

alter table public.process_events
  add column if not exists start_time text;

alter table public.process_events
  add column if not exists end_time text;
