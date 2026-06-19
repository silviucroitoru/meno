-- Email tracking for contraception submissions (mirrors submission_email_status)

CREATE TABLE IF NOT EXISTS public.contraception_email_status (
  submission_id bigint PRIMARY KEY REFERENCES public.contraception_submissions(id) ON DELETE CASCADE,
  resend_email_id text,
  last_event text,
  last_event_at timestamptz,
  last_payload jsonb,
  clicked_consultation_at timestamptz,
  clicked_checkup_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contraception_email_status_resend_email_id_idx
  ON public.contraception_email_status(resend_email_id);

ALTER TABLE public.contraception_email_status ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_contraception_email_status_touch ON public.contraception_email_status;
CREATE TRIGGER trg_contraception_email_status_touch
BEFORE UPDATE ON public.contraception_email_status
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- Drop the email_sent column (no longer needed; we use contraception_email_status instead)
ALTER TABLE public.contraception_submissions DROP COLUMN IF EXISTS email_sent;

-- Update admin_list_contraception_submissions to include email status
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
      nullif(trim(coalesce(s.responses->>'Email', '')), '') AS email,
      es.last_event AS email_status,
      es.last_event_at AS email_status_at,
      es.clicked_consultation_at,
      es.clicked_checkup_at
    FROM public.contraception_submissions s
    LEFT JOIN public.contraception_email_status es ON es.submission_id = s.id
    WHERE nullif(trim(coalesce(s.responses->>'Email', '')), '') IS NOT NULL
      AND nullif(trim(coalesce(s.responses->>'FirstName', '')), '') IS NOT NULL
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

-- Update admin_contraception_metrics to include email statistics
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
  v_by_email_status json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING errcode = '42501';
  END IF;

  SELECT count(*)
    INTO v_total_submissions
    FROM public.contraception_submissions
    WHERE responses <> '{}'::jsonb;

  SELECT count(*)
    INTO v_completed
    FROM public.contraception_submissions
    WHERE nullif(trim(coalesce(responses->>'Email', '')), '') IS NOT NULL;

  IF v_total_submissions > 0 THEN
    v_completion_pct := round((v_completed::numeric / v_total_submissions::numeric) * 100, 1);
  ELSE
    v_completion_pct := 0;
  END IF;

  SELECT coalesce(json_object_agg(label, cnt), '{}'::json)
    INTO v_by_email_status
    FROM (
      SELECT label, count(*) AS cnt FROM (
        SELECT 'Sent' AS label FROM public.contraception_email_status
        UNION ALL
        SELECT 'Delivered' FROM public.contraception_email_status WHERE last_event IN ('email.delivered', 'email.opened', 'email.clicked')
        UNION ALL
        SELECT 'Opened' FROM public.contraception_email_status WHERE last_event IN ('email.opened', 'email.clicked')
        UNION ALL
        SELECT 'Clicked' FROM public.contraception_email_status WHERE clicked_consultation_at IS NOT NULL OR clicked_checkup_at IS NOT NULL
        UNION ALL
        SELECT 'Bounced' FROM public.contraception_email_status WHERE last_event = 'email.bounced'
      ) sub
      GROUP BY label
    ) agg;

  RETURN json_build_object(
    'totalSubmissions', v_total_submissions,
    'completedSubmissions', v_completed,
    'completionRatePct', v_completion_pct,
    'byEmailStatus', v_by_email_status
  );
END;
$admin_contra_metrics_body$;

GRANT EXECUTE ON FUNCTION public.admin_contraception_metrics TO authenticated;
