import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.90.0?target=deno";

type ResendWebhookPayload = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    tags?: Record<string, string>;
    click?: { link?: string; timestamp?: string };
  };
};

function getHeader(req: Request, name: string): string | null {
  return req.headers.get(name) ?? req.headers.get(name.toLowerCase());
}

function parseSubmissionId(tags: Record<string, string> | undefined): number | null {
  const raw = tags?.submission_id;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET")?.trim();
  if (!webhookSecret) return new Response("Webhook secret not configured", { status: 500 });

  const payloadText = await req.text();
  const svixId = getHeader(req, "svix-id");
  const svixTimestamp = getHeader(req, "svix-timestamp");
  const svixSignature = getHeader(req, "svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing webhook signature headers", { status: 400 });
  }

  let verified: ResendWebhookPayload;
  try {
    const wh = new Webhook(webhookSecret);
    verified = wh.verify(payloadText, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendWebhookPayload;
  } catch (_err) {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const submissionIdFromTag = parseSubmissionId(verified?.data?.tags);
  const emailType = verified?.data?.tags?.type ?? "menopause";
  const tableName = emailType === "contraception" ? "contraception_email_status" : "submission_email_status";
  const resendEmailId = verified?.data?.email_id ?? null;
  const eventType = verified?.type ?? "unknown";
  const eventAt = verified?.created_at ?? new Date().toISOString();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const classifyClick = (link: string | undefined): string | null => {
    if (!link) return null;
    if (link.includes("setmore.com") || link.includes("btn=consultation")) return "consultation";
    if (
      link.includes("istrazi-nase-usluge") ||
      link.includes("konsultacija-ginekologa") ||
      link.includes("btn=checkup")
    ) {
      return "checkup";
    }
    return null;
  };

  const upsertStatus = async (submissionId: number) => {
    const row: Record<string, unknown> = {
      submission_id: submissionId,
      resend_email_id: resendEmailId,
      last_event: eventType,
      last_event_at: eventAt,
      last_payload: verified,
    };

    if (eventType === "email.clicked") {
      const clickLink = verified?.data?.click?.link;
      const clickType = classifyClick(clickLink);
      const clickedAt = verified?.data?.click?.timestamp ?? eventAt;
      console.log(`[click] sid=${submissionId} table=${tableName} link=${clickLink} type=${clickType}`);

      if (clickType === "consultation") {
        const { data: existing } = await supabase.from(tableName)
          .select("clicked_consultation_at").eq("submission_id", submissionId).maybeSingle();
        if (!existing?.clicked_consultation_at) row.clicked_consultation_at = clickedAt;
      } else if (clickType === "checkup") {
        const { data: existing } = await supabase.from(tableName)
          .select("clicked_checkup_at").eq("submission_id", submissionId).maybeSingle();
        if (!existing?.clicked_checkup_at) row.clicked_checkup_at = clickedAt;
      }
    }

    const { error } = await supabase.from(tableName).upsert(row);
    if (error) throw error;
  };

  try {
    if (submissionIdFromTag) {
      await upsertStatus(submissionIdFromTag);
      return new Response("OK", { status: 200 });
    }

    if (resendEmailId) {
      // Try menopause table first, then contraception
      const { data } = await supabase
        .from("submission_email_status")
        .select("submission_id")
        .eq("resend_email_id", resendEmailId)
        .maybeSingle();
      if (data?.submission_id) {
        await supabase.from("submission_email_status").upsert({
          submission_id: data.submission_id,
          resend_email_id: resendEmailId,
          last_event: eventType,
          last_event_at: eventAt,
          last_payload: verified,
        });
        return new Response("OK", { status: 200 });
      }

      const { data: contraData } = await supabase
        .from("contraception_email_status")
        .select("submission_id")
        .eq("resend_email_id", resendEmailId)
        .maybeSingle();
      if (contraData?.submission_id) {
        await supabase.from("contraception_email_status").upsert({
          submission_id: contraData.submission_id,
          resend_email_id: resendEmailId,
          last_event: eventType,
          last_event_at: eventAt,
          last_payload: verified,
        });
        return new Response("OK", { status: 200 });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("resend-webhook error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});

