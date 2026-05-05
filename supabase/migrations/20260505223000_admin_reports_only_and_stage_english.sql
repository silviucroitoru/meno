-- Admin dashboard: show only rows with reports + normalize stage to English
--
-- - `admin_list_submissions`: only include submissions that have a report (INNER JOIN reports)
-- - `admin_metrics`: compute metrics only over reports; normalize stage labels to EN

CREATE OR REPLACE FUNCTION public.normalize_menopause_stage(p_stage text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(trim(coalesce(p_stage, '')))
    -- English (already ok)
    WHEN 'premenopause' THEN 'Premenopause'
    WHEN 'perimenopause' THEN 'Perimenopause'
    WHEN 'menopause' THEN 'Menopause'
    WHEN 'postmenopause' THEN 'Postmenopause'
    WHEN 'undefined' THEN 'Undefined'

    -- Serbian (common forms)
    WHEN 'premenopauza' THEN 'Premenopause'
    WHEN 'perimenopauza' THEN 'Perimenopause'
    WHEN 'menopauza' THEN 'Menopause'
    WHEN 'postmenopauza' THEN 'Postmenopause'
    WHEN 'neodređeno' THEN 'Undefined'
    WHEN 'neodredjeno' THEN 'Undefined'
    WHEN 'neodređeni' THEN 'Undefined'
    WHEN 'neodredjeni' THEN 'Undefined'

    -- Romanian
    WHEN 'premenopauză' THEN 'Premenopause'
    WHEN 'premenopauza' THEN 'Premenopause'
    WHEN 'perimenopauză' THEN 'Perimenopause'
    WHEN 'perimenopauza' THEN 'Perimenopause'
    WHEN 'menopauză' THEN 'Menopause'
    WHEN 'menopauza' THEN 'Menopause'
    WHEN 'postmenopauză' THEN 'Postmenopause'
    WHEN 'postmenopauza' THEN 'Postmenopause'
    WHEN 'nedefinită' THEN 'Undefined'
    WHEN 'nedefinita' THEN 'Undefined'
    WHEN 'nedefinit' THEN 'Undefined'

    -- Fallbacks
    WHEN '' THEN 'Unknown'
    ELSE p_stage
  END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_menopause_stage(text) TO authenticated;

-- =============================================================
-- Admin metrics (reports only)
-- =============================================================

CREATE OR REPLACE FUNCTION public.admin_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $admin_metrics_body$
DECLARE
  v_submission_count bigint;
  v_report_count bigint;
  v_pdf_count bigint;
  v_by_stage json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING errcode = '42501';
  END IF;

  -- Only submissions that have a report.
  SELECT count(DISTINCT r.submission_id)
    INTO v_submission_count
    FROM public.reports r
    WHERE r.menopause_report IS NOT NULL;

  SELECT count(*)
    INTO v_report_count
    FROM public.reports r
    WHERE r.menopause_report IS NOT NULL;

  SELECT count(*)
    INTO v_pdf_count
    FROM public.reports r
    WHERE r.menopause_report IS NOT NULL
      AND nullif(trim(coalesce(r.pdf_url, '')), '') IS NOT NULL;

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
    'submissionCount', v_submission_count,
    'reportCount', v_report_count,
    'pdfCount', v_pdf_count,
    'byStage', v_by_stage
  );
END;
$admin_metrics_body$;

GRANT EXECUTE ON FUNCTION public.admin_metrics TO authenticated;

-- =============================================================
-- Admin list submissions (reports only, paginated + searchable)
-- =============================================================

CREATE OR REPLACE FUNCTION public.admin_list_submissions(
  p_search text DEFAULT null,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $admin_list_body$
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
      nullif(trim(coalesce(s.responses->>'Email', '')), '') AS email,
      public.normalize_menopause_stage(
        nullif(trim(coalesce(r.menopause_report #>> '{menopauseStage,stage}', '')), '')
      ) AS stage,
      r.pdf_url
    FROM public.submissions s
    INNER JOIN public.reports r ON r.submission_id = s.id
    WHERE r.menopause_report IS NOT NULL
  ),
  filtered AS (
    SELECT * FROM base b
    WHERE v_like IS NULL
      OR coalesce(b.first_name, '') ILIKE v_like
      OR coalesce(b.email, '') ILIKE v_like
      OR b.submission_id::text ILIKE v_like
      OR coalesce(b.language, '') ILIKE v_like
      OR coalesce(b.stage, '') ILIKE v_like
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
$admin_list_body$;

GRANT EXECUTE ON FUNCTION public.admin_list_submissions TO authenticated;

