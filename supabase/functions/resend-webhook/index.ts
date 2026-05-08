import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.90.0?target=deno";

type ResendWebhookPayload = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    tags?: Record<string, string>;
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
  const resendEmailId = verified?.data?.email_id ?? null;
  const eventType = verified?.type ?? "unknown";
  const eventAt = verified?.created_at ?? new Date().toISOString();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const upsertStatus = async (submissionId: number) => {
    const { error } = await supabase.from("submission_email_status").upsert({
      submission_id: submissionId,
      resend_email_id: resendEmailId,
      last_event: eventType,
      last_event_at: eventAt,
      last_payload: verified,
    });
    if (error) throw error;
  };

  try {
    if (submissionIdFromTag) {
      await upsertStatus(submissionIdFromTag);
      return new Response("OK", { status: 200 });
    }

    if (resendEmailId) {
      const { data, error } = await supabase
        .from("submission_email_status")
        .select("submission_id")
        .eq("resend_email_id", resendEmailId)
        .maybeSingle();
      if (error) throw error;
      const submissionId = data?.submission_id as number | undefined;
      if (submissionId) {
        await upsertStatus(submissionId);
        return new Response("OK", { status: 200 });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("resend-webhook error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});

