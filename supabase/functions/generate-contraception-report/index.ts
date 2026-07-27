import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getRecommendedMethods } from "./logic.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function formatMethodsHtml(methods: string[]): string {
  if (methods.length === 0) return "";
  const items = methods.map((m) => `<li>${m}</li>`).join("");
  return `<ul style="margin:0;padding-left:20px;">${items}</ul>`;
}

async function sendContraceptionEmail(
  email: string,
  firstName: string,
  submissionId: number,
  recommendedMethods: string[],
): Promise<string | null> {
  const apiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping contraception email");
    return null;
  }

  const from = Deno.env.get("RESEND_FROM_EMAIL")?.trim() || "Primea <noreply@primea.rs>";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/+$/, "") ?? "";
  const trackBase = `${supabaseUrl}/functions/v1/track-email-click`;
  const consultationUrl = `${trackBase}?sid=${submissionId}&btn=consultation&src=contraception`;
  const checkupUrl = `${trackBase}?sid=${submissionId}&btn=checkup&src=contraception`;

  // Delay send by 30 minutes after questionnaire completion.
  const scheduledAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `${firstName}, Vaši rezultati su spremni`,
      scheduled_at: scheduledAt,
      tags: [
        { name: "submission_id", value: String(submissionId) },
        { name: "type", value: "contraception" },
      ],
      template: {
        id: "32944fca-9f4a-4d3f-9400-a22defb40e3e",
        variables: {
          RECOMMENDED_METHODS: formatMethodsHtml(recommendedMethods),
          RECIPIENT_EMAIL: email,
          CONSULTATION_URL: consultationUrl,
          CHECKUP_URL: checkupUrl,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${errorText}`);
  }

  try {
    const json = await response.json();
    return typeof json?.id === "string" ? json.id : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const submissionId = url.searchParams.get("submissionId");

    if (!submissionId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: submissionId." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: submission, error: subError } = await supabase
      .from("contraception_submissions")
      .select("responses")
      .eq("id", Number(submissionId))
      .single();

    if (subError || !submission) {
      return new Response(
        JSON.stringify({ error: "Submission not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const responses = (submission.responses ?? {}) as Record<string, unknown>;

    const email = String(responses.Email ?? "").trim();
    const firstName = String(responses.FirstName ?? "").trim();
    if (!email || !firstName) {
      return new Response(
        JSON.stringify({ error: "Questionnaire not completed for this submission." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const recommendedMethods = getRecommendedMethods(responses);

    const { data: existingEmail } = await supabase
      .from("contraception_email_status")
      .select("submission_id")
      .eq("submission_id", Number(submissionId))
      .maybeSingle();

    if (!existingEmail) {
      try {
        const resendEmailId = await sendContraceptionEmail(email, firstName, Number(submissionId), recommendedMethods);
        const { error: upsertError } = await supabase.from("contraception_email_status").upsert({
          submission_id: Number(submissionId),
          resend_email_id: resendEmailId,
          last_event: "email.scheduled",
          last_event_at: new Date().toISOString(),
        });
        if (upsertError) {
          console.error("Failed to persist contraception_email_status:", upsertError);
        }
      } catch (emailErr) {
        console.error("Failed to send contraception email:", emailErr);
        const { error: failUpsertError } = await supabase.from("contraception_email_status").upsert({
          submission_id: Number(submissionId),
          last_event: "email.failed",
          last_event_at: new Date().toISOString(),
          last_payload: { error: String(emailErr?.message ?? emailErr) },
        });
        if (failUpsertError) {
          console.error("Failed to persist contraception_email_status failure:", failUpsertError);
        }
      }
    }

    return new Response(
      JSON.stringify({ recommendedMethods, firstName }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("generate-contraception-report error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
