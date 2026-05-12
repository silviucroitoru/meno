import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const language = url.searchParams.get("language") || "EN";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: questionnaire, error: qError } = await supabase
      .from("questionnaires")
      .select("questionnaire")
      .eq("language", language)
      .single();

    if (qError || !questionnaire) {
      return new Response(
        JSON.stringify({ message: `No questionnaire available for language: ${language}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: submission, error: sError } = await supabase
      .from("submissions")
      .insert({ language, responses: {} })
      .select("id")
      .single();

    if (sError || !submission) {
      throw new Error(`Failed to create submission: ${sError?.message}`);
    }

    return new Response(
      JSON.stringify({
        SubmissionID: submission.id,
        questionnaire: questionnaire.questionnaire,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Internal Server Error", error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
