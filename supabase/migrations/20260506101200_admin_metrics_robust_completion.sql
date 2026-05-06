-- Admin metrics: compute completion rate from submissions base
-- This avoids skew from orphan reports (if any) and keeps numerator/denominator consistent.

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

  -- Total questionnaires started (within retention of the submissions table).
  SELECT count(*) INTO v_total_submissions FROM public.submissions;

  -- Successful = submissions that have a report row.
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

  -- Stage breakdown (only successful reports), normalized to English.
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

