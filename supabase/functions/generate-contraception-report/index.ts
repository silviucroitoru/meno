import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getRecommendedMethods } from "./logic.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

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
