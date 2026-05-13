-- Marketing costs: per-admin permission flag, daily spend table, and RPCs.

-- 1. Permission flag on admin_users
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS can_manage_marketing_costs boolean NOT NULL DEFAULT false;

-- 2. Daily spend table
CREATE TABLE IF NOT EXISTS public.marketing_daily_spend (
  day        date PRIMARY KEY,
  amount_usd numeric(12,2) NOT NULL CHECK (amount_usd >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketing_daily_spend ENABLE ROW LEVEL SECURITY;

-- 3. Helper: does the current user have marketing-costs access?
CREATE OR REPLACE FUNCTION public.can_manage_marketing_costs()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.can_manage_marketing_costs = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_manage_marketing_costs TO authenticated;

-- 4. RPC: check access (cheap, used for button visibility)
CREATE OR REPLACE FUNCTION public.admin_marketing_access()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN json_build_object('allowed', public.can_manage_marketing_costs());
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_marketing_access TO authenticated;

-- 5. RPC: get daily range with spend + submissions + CPA
CREATE OR REPLACE FUNCTION public.admin_marketing_range(
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
    LEFT JOIN public.marketing_daily_spend m ON m.day = d.day::date
    LEFT JOIN (
      SELECT
        (s.created_at AT TIME ZONE 'Europe/Belgrade')::date AS day,
        count(*)::int AS cnt
      FROM public.submissions s
      INNER JOIN public.reports r ON r.submission_id = s.id
      WHERE r.menopause_report IS NOT NULL
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

GRANT EXECUTE ON FUNCTION public.admin_marketing_range TO authenticated;

-- 6. RPC: upsert a single day's spend
CREATE OR REPLACE FUNCTION public.admin_marketing_set_day(
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

  INSERT INTO public.marketing_daily_spend (day, amount_usd, updated_at)
  VALUES (p_day, p_amount_usd, now())
  ON CONFLICT (day) DO UPDATE
    SET amount_usd = EXCLUDED.amount_usd,
        updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_marketing_set_day TO authenticated;
