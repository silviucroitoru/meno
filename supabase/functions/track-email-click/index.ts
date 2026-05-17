import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DESTINATIONS: Record<string, string> = {
  consultation:
    "https://primea.setmore.com/book?step=time-slot&products=f620dba3-85bd-4570-8457-08ae5b16f145&type=service&staff=j6N4MDMJRXkT4GLOGHkGumFxtAcSh7IH&staffSelected=true",
  checkup:
    "https://www.primea.rs/service/konsultacija-ginekologa-perimenopauzamenopauza/",
};

const COLUMN_MAP: Record<string, string> = {
  consultation: "clicked_consultation_at",
  checkup: "clicked_checkup_at",
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const sid = url.searchParams.get("sid");
  const btn = url.searchParams.get("btn");

  const destination = btn ? DESTINATIONS[btn] : undefined;
  if (!sid || !destination) {
    return new Response("Bad request", { status: 400 });
  }

  const column = COLUMN_MAP[btn!];
  const submissionId = Number(sid);
  if (!Number.isFinite(submissionId) || submissionId <= 0) {
    return new Response("Bad request", { status: 400 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase
      .from("submission_email_status")
      .update({ [column]: new Date().toISOString() })
      .eq("submission_id", submissionId)
      .is(column, null);
  } catch (err) {
    console.error("track-email-click error:", err);
  }

  return new Response(null, {
    status: 302,
    headers: { Location: destination },
  });
});
