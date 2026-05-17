-- Track which email CTA buttons were clicked (consultation / checkup)

ALTER TABLE public.submission_email_status
  ADD COLUMN IF NOT EXISTS clicked_consultation_at timestamptz,
  ADD COLUMN IF NOT EXISTS clicked_checkup_at timestamptz;

-- Update admin_list_submissions to expose click timestamps

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
      CASE
        WHEN nullif(trim(r.menopause_report->'menoScore'->>'score'), '') ~ '^[0-9]+$'
        THEN (nullif(trim(r.menopause_report->'menoScore'->>'score'), ''))::integer
        ELSE NULL
      END AS score,
      es.last_event AS email_status,
      es.last_event_at AS email_status_at,
      es.clicked_consultation_at,
      es.clicked_checkup_at
    FROM public.submissions s
    INNER JOIN public.reports r ON r.submission_id = s.id
    LEFT JOIN public.submission_email_status es ON es.submission_id = s.id
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
      OR coalesce(b.score::text, '') ILIKE v_like
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

GRANT EXECUTE ON FUNCTION public.admin_list_submissions(text, int, int) TO authenticated;
