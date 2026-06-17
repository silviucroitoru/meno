-- Admin RPCs for contraception submissions: metrics + paginated list.

CREATE OR REPLACE FUNCTION public.admin_contraception_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $admin_contra_metrics_body$
DECLARE
  v_total_submissions bigint;
  v_completed bigint;
  v_completion_pct numeric;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING errcode = '42501';
  END IF;

  -- Questionnaires started: any submission with at least one answer.
  SELECT count(*)
    INTO v_total_submissions
    FROM public.contraception_submissions
    WHERE responses <> '{}'::jsonb;

  -- Completed: provided an email (the completion trigger in the flow).
  SELECT count(*)
    INTO v_completed
    FROM public.contraception_submissions
    WHERE nullif(trim(coalesce(responses->>'Email', '')), '') IS NOT NULL;

  IF v_total_submissions > 0 THEN
    v_completion_pct := round((v_completed::numeric / v_total_submissions::numeric) * 100, 1);
  ELSE
    v_completion_pct := 0;
  END IF;

  RETURN json_build_object(
    'totalSubmissions', v_total_submissions,
    'completedSubmissions', v_completed,
    'completionRatePct', v_completion_pct
  );
END;
$admin_contra_metrics_body$;

GRANT EXECUTE ON FUNCTION public.admin_contraception_metrics TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_list_contraception_submissions(
  p_search text DEFAULT null,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $admin_contra_list_body$
DECLARE
  v_limit int := least(coalesce(p_limit, 50), 200);
  v_offset int := greatest(coalesce(p_offset, 0), 0);
  v_search text := nullif(trim(coalesce(p_search, '')), '');
  v_like text := CASE WHEN v_search IS NULL THEN NULL ELSE '%' || v_search || '%' END;
  v_total bigint;
  v_rows json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING errcode = '42501';
  END IF;

  WITH base AS (
    SELECT
      s.id AS submission_id,
      s.created_at,
      s.language,
      nullif(trim(coalesce(s.responses->>'FirstName', '')), '') AS first_name,
      nullif(trim(coalesce(s.responses->>'Email', '')), '') AS email
    FROM public.contraception_submissions s
    WHERE s.responses <> '{}'::jsonb
  ),
  filtered AS (
    SELECT * FROM base b
    WHERE v_like IS NULL
      OR coalesce(b.first_name, '') ILIKE v_like
      OR coalesce(b.email, '') ILIKE v_like
      OR b.submission_id::text ILIKE v_like
      OR coalesce(b.language, '') ILIKE v_like
  )
  SELECT
    (SELECT count(*) FROM filtered),
    coalesce(json_agg(row_to_json(page) ORDER BY page.created_at DESC), '[]'::json)
  INTO v_total, v_rows
  FROM (
    SELECT * FROM filtered
    ORDER BY created_at DESC
    LIMIT v_limit OFFSET v_offset
  ) page;

  RETURN json_build_object(
    'total', v_total,
    'limit', v_limit,
    'offset', v_offset,
    'rows', v_rows
  );
END;
$admin_contra_list_body$;

GRANT EXECUTE ON FUNCTION public.admin_list_contraception_submissions(text, int, int) TO authenticated;
