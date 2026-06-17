-- Contraception marketing costs + daily submissions, mirroring the menopause admin RPCs.
-- All new objects; existing tables and functions are untouched.

-- Daily spend table for contraception
CREATE TABLE IF NOT EXISTS public.contraception_marketing_daily_spend (
  day        date PRIMARY KEY,
  amount_usd numeric(12,2) NOT NULL CHECK (amount_usd >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contraception_marketing_daily_spend ENABLE ROW LEVEL SECURITY;

-- Daily completed submissions for the activity chart.
-- Completion = submission has an Email answer.
CREATE OR REPLACE FUNCTION public.admin_contraception_daily_submissions(
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
      FROM public.contraception_submissions s
      WHERE nullif(trim(coalesce(s.responses->>'Email', '')), '') IS NOT NULL
        AND (s.created_at AT TIME ZONE 'Europe/Belgrade')::date BETWEEN p_from AND p_to
      GROUP BY 1
    ) cnt ON cnt.day = d.day::date
    ORDER BY d.day
  ) t;

  RETURN coalesce(v_result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_contraception_daily_submissions TO authenticated;

-- Daily marketing range: spend + submissions + CPA for contraception.
CREATE OR REPLACE FUNCTION public.admin_contraception_marketing_range(
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
    LEFT JOIN public.contraception_marketing_daily_spend m ON m.day = d.day::date
    LEFT JOIN (
      SELECT
        (s.created_at AT TIME ZONE 'Europe/Belgrade')::date AS day,
        count(*)::int AS cnt
      FROM public.contraception_submissions s
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

GRANT EXECUTE ON FUNCTION public.admin_contraception_marketing_range TO authenticated;

-- Upsert a single day's contraception spend.
CREATE OR REPLACE FUNCTION public.admin_contraception_marketing_set_day(
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

  INSERT INTO public.contraception_marketing_daily_spend (day, amount_usd, updated_at)
  VALUES (p_day, p_amount_usd, now())
  ON CONFLICT (day) DO UPDATE
    SET amount_usd = EXCLUDED.amount_usd,
        updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_contraception_marketing_set_day TO authenticated;
