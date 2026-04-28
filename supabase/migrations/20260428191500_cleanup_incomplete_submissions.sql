-- Cleanup stale/incomplete submissions.
-- A submission is considered "complete" if it has a corresponding row in `reports`.
-- We delete submissions that:
--  - have no report
--  - are older than a retention window (default: 24 hours)
--  - and are very likely incomplete (missing Email in responses)

-- Enable pg_cron (Supabase supports this extension).
create extension if not exists pg_cron with schema extensions;

-- Function: delete stale incomplete submissions
create or replace function public.cleanup_incomplete_submissions(retention interval default interval '24 hours')
returns integer
language plpgsql
as $$
declare
  deleted_count integer;
begin
  with to_delete as (
    select s.id
    from public.submissions s
    left join public.reports r on r.submission_id = s.id
    where r.submission_id is null
      and coalesce(s.last_updated, s.created_at) < now() - retention
      and (s.responses ? 'Email') is false
  )
  delete from public.submissions s
  using to_delete d
  where s.id = d.id;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Run every day at 03:30 UTC. Adjust as needed.
-- Note: job name must be unique within the DB.
select
  cron.schedule(
    'cleanup-incomplete-submissions-daily',
    '30 3 * * *',
    $$select public.cleanup_incomplete_submissions(interval '24 hours');$$
  );

