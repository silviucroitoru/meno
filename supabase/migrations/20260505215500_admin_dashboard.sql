-- Admin dashboard support (Primea Menoscore)
--
-- This migration:
-- - Locks down public access to base tables (questionnaires/submissions/reports)
-- - Adds an admin allow-list table (admin_users)
-- - Adds admin-only RPCs: admin_metrics, admin_list_submissions
--
-- Admins are Supabase Auth users (email/password) whose auth.uid() is present in admin_users.

-- Ensure RLS is enabled (already enabled in initial schema, but keep idempotent).
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Remove the permissive policies created in the initial migration.
-- Edge Functions use the service role key and bypass RLS anyway, so locking these down is safe.
DROP POLICY IF EXISTS "service_role_all" ON questionnaires;
DROP POLICY IF EXISTS "service_role_all" ON submissions;
DROP POLICY IF EXISTS "service_role_all" ON reports;

-- =============================================================
-- Admin allow-list
-- =============================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Disallow direct access; admin rights are checked via SECURITY DEFINER functions.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- =============================================================
-- Admin metrics
-- Returns:
-- - submissionCount: total submissions rows
-- - reportCount: total reports rows
-- - pdfCount: reports with non-empty pdf_url
-- - byStage: breakdown by menopauseStage.stage (from reports.menopause_report JSON)
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

  SELECT count(*) INTO v_submission_count FROM public.submissions;
  SELECT count(*) INTO v_report_count FROM public.reports;

  SELECT count(*)
    INTO v_pdf_count
    FROM public.reports r
    WHERE nullif(trim(coalesce(r.pdf_url, '')), '') IS NOT NULL;

  SELECT coalesce(json_object_agg(stage, cnt), '{}'::json)
    INTO v_by_stage
    FROM (
      SELECT
        coalesce(nullif(trim(r.menopause_report #>> '{menopauseStage,stage}'), ''), 'Unknown') as stage,
        count(*)::bigint as cnt
      FROM public.reports r
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
-- Admin list submissions (paginated + searchable)
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
      nullif(trim(coalesce(r.menopause_report #>> '{menopauseStage,stage}', '')), '') AS stage,
      r.pdf_url
    FROM public.submissions s
    LEFT JOIN public.reports r ON r.submission_id = s.id
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

