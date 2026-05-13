-- Exclude submissions with no answers from completion rate.
-- A "submission" is only counted once the user has actually answered at least one question.
--
-- Changes:
-- - cleanup_incomplete_submissions: hard-delete empty (responses = '{}') rows; still archive started-but-incomplete rows.
-- - admin_metrics: ignore live submissions where responses = '{}'.

CREATE OR REPLACE FUNCTION public.cleanup_incomplete_submissions(retention interval default interval '24 hours')
returns integer
language plpgsql
as $$
declare
  deleted_count integer;
begin
  -- Hard-delete empty submissions immediately (no archive, no metric impact).
  delete from public.submissions
  where responses = '{}'::jsonb
    and coalesce(last_updated, created_at) < now() - retention
    and not exists (select 1 from public.reports r where r.submission_id = submissions.id);

  -- Archive then delete incomplete-but-started submissions (have at least one answer, no email, no report).
  with to_archive as (
    select
      s.id,
      s.created_at,
      s.last_updated,
      s.language,
      (s.responses ? 'Email') as had_email
    from public.submissions s
    left join public.reports r on r.submission_id = s.id
    where r.submission_id is null
      and coalesce(s.last_updated, s.created_at) < now() - retention
      and (s.responses ? 'Email') is false
      and s.responses <> '{}'::jsonb
  ),
  archived as (
    insert into public.submissions_archive (submission_id, created_at, last_updated, language, had_email, archived_at)
    select id, created_at, last_updated, language, had_email, now()
    from to_archive
    on conflict (submission_id) do nothing
    returning submission_id
  )
  delete from public.submissions s
  using to_archive d
  where s.id = d.id;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

CREATE OR REPLACE FUNCTION public.admin_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $admin_metrics_body$
DECLARE
  v_total_submissions bigint;
  v_successful bigint;
  v_without_report bigint;
  v_completion_pct numeric;
  v_by_stage json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING errcode = '42501';
  END IF;

  -- All-time questionnaires started = live submissions with at least one answer + archived incompletes.
  SELECT
    (select count(*) from public.submissions where responses <> '{}'::jsonb)
    + (select count(*) from public.submissions_archive)
    INTO v_total_submissions;

  SELECT count(*)
    INTO v_successful
    FROM public.submissions s
    WHERE EXISTS (
      SELECT 1
      FROM public.reports r
      WHERE r.submission_id = s.id
        AND r.menopause_report IS NOT NULL
    );

  v_without_report := greatest(v_total_submissions - v_successful, 0);

  IF v_total_submissions > 0 THEN
    v_completion_pct := round((v_successful::numeric / v_total_submissions::numeric) * 100, 1);
  ELSE
    v_completion_pct := 0;
  END IF;

  SELECT coalesce(json_object_agg(stage, cnt), '{}'::json)
    INTO v_by_stage
    FROM (
      SELECT
        public.normalize_menopause_stage(
          coalesce(nullif(trim(r.menopause_report #>> '{menopauseStage,stage}'), ''), 'Unknown')
        ) as stage,
        count(*)::bigint as cnt
      FROM public.reports r
      WHERE r.menopause_report IS NOT NULL
      GROUP BY 1
    ) s;

  RETURN json_build_object(
    'successfulSubmissions', v_successful,
    'totalSubmissions', v_total_submissions,
    'withoutReportCount', v_without_report,
    'completionRatePct', v_completion_pct,
    'byStage', v_by_stage
  );
END;
$admin_metrics_body$;

GRANT EXECUTE ON FUNCTION public.admin_metrics TO authenticated;
