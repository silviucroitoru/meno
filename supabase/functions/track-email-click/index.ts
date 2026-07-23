import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MENOPAUSE_CONSULTATION_URL =
  "https://primea.setmore.com/book?step=time-slot&products=f620dba3-85bd-4570-8457-08ae5b16f145&type=service&staff=j6N4MDMJRXkT4GLOGHkGumFxtAcSh7IH&staffSelected=true";
const CONTRACEPTION_CONSULTATION_URL =
  "https://primea.setmore.com/j6N4MDMJRXkT4GLOGHkGumFxtAcSh7IH/service/698d95bc-3b32-402d-9b6b-9e08c2bca235";
const IR_CONSULTATION_URL =
  "https://primea.setmore.com/OyOIVgxts2a0vdNfiVkHTJY2aLZy54g2/service/cbc5c629-8973-41e7-8e4f-643a8749f90f";
const MENOPAUSE_CHECKUP_URL =
  "https://www.primea.rs/sr/istrazi-nase-usluge?tip=Ginekologija";
const CHECKUP_URL = "https://www.primea.rs/istrazi-nase-usluge/";

const COLUMN_MAP: Record<string, string> = {
  consultation: "clicked_consultation_at",
  checkup: "clicked_checkup_at",
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const sid = url.searchParams.get("sid");
  const btn = url.searchParams.get("btn");
  const src = url.searchParams.get("src");

  const destination =
    btn === "consultation"
      ? src === "contraception"
        ? CONTRACEPTION_CONSULTATION_URL
        : src === "ir"
          ? IR_CONSULTATION_URL
          : MENOPAUSE_CONSULTATION_URL
      : btn === "checkup"
        ? src === "contraception" || src === "ir"
          ? CHECKUP_URL
          : MENOPAUSE_CHECKUP_URL
        : undefined;
  if (!sid || !destination) {
    return new Response("Bad request", { status: 400 });
  }

  const column = COLUMN_MAP[btn!];
  const submissionId = Number(sid);
  if (!Number.isFinite(submissionId) || submissionId <= 0) {
    return new Response("Bad request", { status: 400 });
  }

  const tableName = src === "contraception"
    ? "contraception_email_status"
    : src === "ir"
      ? "ir_email_status"
      : "submission_email_status";

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase
      .from(tableName)
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
