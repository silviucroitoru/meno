-- Insulin Resistance questionnaire: separate tables mirroring the contraception pattern.

-- Questionnaire definitions (keyed by language)
CREATE TABLE IF NOT EXISTS public.ir_questionnaires (
  language TEXT PRIMARY KEY,
  questionnaire JSONB NOT NULL
);

-- Submissions
CREATE TABLE IF NOT EXISTS public.ir_submissions (
  id SERIAL PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'EN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ
);

ALTER TABLE public.ir_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ir_submissions ENABLE ROW LEVEL SECURITY;

-- Atomic merge of a single response into the JSONB blob.
CREATE OR REPLACE FUNCTION public.merge_ir_submission_response(
  p_submission_id bigint,
  p_key text,
  p_value jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ir_submissions
  SET responses = coalesce(responses, '{}'::jsonb) || jsonb_build_object(p_key, p_value),
      last_updated = now()
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SubmissionID % not found', p_submission_id
      USING errcode = 'P0001';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.merge_ir_submission_response TO anon, authenticated, service_role;

-- Email tracking
CREATE TABLE IF NOT EXISTS public.ir_email_status (
  submission_id bigint PRIMARY KEY REFERENCES public.ir_submissions(id) ON DELETE CASCADE,
  resend_email_id text,
  last_event text,
  last_event_at timestamptz,
  last_payload jsonb,
  clicked_consultation_at timestamptz,
  clicked_checkup_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ir_email_status_resend_email_id_idx
  ON public.ir_email_status(resend_email_id);

ALTER TABLE public.ir_email_status ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_ir_email_status_touch ON public.ir_email_status;
CREATE TRIGGER trg_ir_email_status_touch
BEFORE UPDATE ON public.ir_email_status
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- Daily spend table
CREATE TABLE IF NOT EXISTS public.ir_marketing_daily_spend (
  day        date PRIMARY KEY,
  amount_usd numeric(12,2) NOT NULL CHECK (amount_usd >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ir_marketing_daily_spend ENABLE ROW LEVEL SECURITY;

-- Admin metrics
CREATE OR REPLACE FUNCTION public.admin_ir_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    FROM public.ir_submissions
    WHERE responses <> '{}'::jsonb;

  SELECT count(*)
    INTO v_completed
    FROM public.ir_submissions
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
        SELECT 'Sent' AS label FROM public.ir_email_status
        UNION ALL
        SELECT 'Delivered' FROM public.ir_email_status WHERE last_event IN ('email.delivered', 'email.opened', 'email.clicked')
        UNION ALL
        SELECT 'Opened' FROM public.ir_email_status WHERE last_event IN ('email.opened', 'email.clicked')
        UNION ALL
        SELECT 'Clicked' FROM public.ir_email_status WHERE clicked_consultation_at IS NOT NULL OR clicked_checkup_at IS NOT NULL
        UNION ALL
        SELECT 'Bounced' FROM public.ir_email_status WHERE last_event = 'email.bounced'
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
$$;

GRANT EXECUTE ON FUNCTION public.admin_ir_metrics TO authenticated;

-- Admin list submissions with email status
CREATE OR REPLACE FUNCTION public.admin_list_ir_submissions(
  p_search text DEFAULT null,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    FROM public.ir_submissions s
    LEFT JOIN public.ir_email_status es ON es.submission_id = s.id
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
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_ir_submissions(text, int, int) TO authenticated;

-- Daily completed submissions
CREATE OR REPLACE FUNCTION public.admin_ir_daily_submissions(
  p_from date DEFAULT current_date - 6,
  p_to   date DEFAULT current_date
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden' USING errcode = 'P0001';
  END IF;

  SELECT json_agg(row_to_json(t))
  INTO v_result
  FROM (
    SELECT
      d.day::date::text AS day,
      coalesce(cnt.count, 0) AS count
    FROM generate_series(p_from, p_to, '1 day'::interval) AS d(day)
    LEFT JOIN (
      SELECT
        (s.created_at AT TIME ZONE 'Europe/Belgrade')::date AS day,
        count(*)::int AS count
      FROM public.ir_submissions s
      WHERE nullif(trim(coalesce(s.responses->>'Email', '')), '') IS NOT NULL
        AND (s.created_at AT TIME ZONE 'Europe/Belgrade')::date BETWEEN p_from AND p_to
      GROUP BY 1
    ) cnt ON cnt.day = d.day::date
    ORDER BY d.day
  ) t;

  RETURN coalesce(v_result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_ir_daily_submissions TO authenticated;

-- Marketing range
CREATE OR REPLACE FUNCTION public.admin_ir_marketing_range(
  p_from date DEFAULT current_date - 6,
  p_to   date DEFAULT current_date
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows json;
  v_total_spend numeric;
  v_total_subs  bigint;
BEGIN
  IF NOT public.can_manage_marketing_costs() THEN
    RAISE EXCEPTION 'Forbidden' USING errcode = 'P0001';
  END IF;

  SELECT
    json_agg(row_to_json(t) ORDER BY t.day),
    coalesce(sum(t.spend_usd), 0),
    coalesce(sum(t.successful_submissions), 0)
  INTO v_rows, v_total_spend, v_total_subs
  FROM (
    SELECT
      d.day::date::text AS day,
      coalesce(m.amount_usd, 0) AS spend_usd,
      coalesce(sub.cnt, 0) AS successful_submissions,
      CASE
        WHEN coalesce(sub.cnt, 0) > 0
        THEN round(coalesce(m.amount_usd, 0) / sub.cnt, 2)
        ELSE NULL
      END AS cost_per_submission_usd
    FROM generate_series(p_from, p_to, '1 day'::interval) AS d(day)
    LEFT JOIN public.ir_marketing_daily_spend m ON m.day = d.day::date
    LEFT JOIN (
      SELECT
        (s.created_at AT TIME ZONE 'Europe/Belgrade')::date AS day,
        count(*)::int AS cnt
      FROM public.ir_submissions s
      WHERE nullif(trim(coalesce(s.responses->>'Email', '')), '') IS NOT NULL
        AND (s.created_at AT TIME ZONE 'Europe/Belgrade')::date BETWEEN p_from AND p_to
      GROUP BY 1
    ) sub ON sub.day = d.day::date
  ) t;

  RETURN json_build_object(
    'total_spend_usd', coalesce(v_total_spend, 0),
    'total_submissions', coalesce(v_total_subs, 0),
    'avg_cpa_usd', CASE WHEN v_total_subs > 0 THEN round(v_total_spend / v_total_subs, 2) ELSE NULL END,
    'rows', coalesce(v_rows, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_ir_marketing_range TO authenticated;

-- Upsert a single day's IR spend
CREATE OR REPLACE FUNCTION public.admin_ir_marketing_set_day(
  p_day        date,
  p_amount_usd numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_manage_marketing_costs() THEN
    RAISE EXCEPTION 'Forbidden' USING errcode = 'P0001';
  END IF;

  INSERT INTO public.ir_marketing_daily_spend (day, amount_usd, updated_at)
  VALUES (p_day, p_amount_usd, now())
  ON CONFLICT (day) DO UPDATE
    SET amount_usd = EXCLUDED.amount_usd,
        updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_ir_marketing_set_day TO authenticated;

-- Seed: copy contraception questionnaire as placeholder (user will edit later)
INSERT INTO public.ir_questionnaires (language, questionnaire)
SELECT language, questionnaire FROM public.contraception_questionnaires
ON CONFLICT (language) DO NOTHING;

NOTIFY pgrst, 'reload schema';
