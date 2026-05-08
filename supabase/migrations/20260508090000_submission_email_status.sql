-- Track latest Resend email status per submission

CREATE TABLE IF NOT EXISTS public.submission_email_status (
  submission_id bigint PRIMARY KEY REFERENCES public.submissions(id) ON DELETE CASCADE,
  resend_email_id text,
  last_event text,
  last_event_at timestamptz,
  last_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS submission_email_status_resend_email_id_idx
  ON public.submission_email_status(resend_email_id);

ALTER TABLE public.submission_email_status ENABLE ROW LEVEL SECURITY;

-- No direct access; only SECURITY DEFINER functions and service role should use this.

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_submission_email_status_touch ON public.submission_email_status;
CREATE TRIGGER trg_submission_email_status_touch
BEFORE UPDATE ON public.submission_email_status
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

