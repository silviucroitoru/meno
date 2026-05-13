CREATE OR REPLACE FUNCTION public.admin_daily_submissions(
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
      d.day::text AS day,
      coalesce(cnt.count, 0) AS count
    FROM generate_series(p_from, p_to, '1 day'::interval) AS d(day)
    LEFT JOIN (
      SELECT
        (s.created_at AT TIME ZONE 'Europe/Belgrade')::date AS day,
        count(*)::int AS count
      FROM submissions s
      INNER JOIN reports r ON r.submission_id = s.id
      WHERE r.menopause_report IS NOT NULL
        AND (s.created_at AT TIME ZONE 'Europe/Belgrade')::date BETWEEN p_from AND p_to
      GROUP BY 1
    ) cnt ON cnt.day = d.day::date
    ORDER BY d.day
  ) t;

  RETURN coalesce(v_result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_daily_submissions TO authenticated;
