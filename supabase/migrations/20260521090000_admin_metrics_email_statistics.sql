-- Add email status breakdown to admin_metrics.

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
  v_by_email_status json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING errcode = '42501';
  END IF;

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

  SELECT coalesce(json_object_agg(label, cnt), '{}'::json)
    INTO v_by_email_status
    FROM (
      SELECT label, count(*)::bigint AS cnt
      FROM (
        SELECT 'Sent' AS label FROM public.submission_email_status
        UNION ALL
        SELECT 'Delivered' FROM public.submission_email_status WHERE last_event IN ('email.delivered', 'email.opened', 'email.clicked')
        UNION ALL
        SELECT 'Opened' FROM public.submission_email_status WHERE last_event IN ('email.opened', 'email.clicked')
        UNION ALL
        SELECT 'Clicked' FROM public.submission_email_status WHERE clicked_consultation_at IS NOT NULL OR clicked_checkup_at IS NOT NULL
        UNION ALL
        SELECT 'Bounced' FROM public.submission_email_status WHERE last_event = 'email.bounced'
      ) raw
      GROUP BY label
    ) agg;

  RETURN json_build_object(
    'successfulSubmissions', v_successful,
    'totalSubmissions', v_total_submissions,
    'withoutReportCount', v_without_report,
    'completionRatePct', v_completion_pct,
    'byStage', v_by_stage,
    'byEmailStatus', v_by_email_status
  );
END;
$admin_metrics_body$;

GRANT EXECUTE ON FUNCTION public.admin_metrics TO authenticated;
