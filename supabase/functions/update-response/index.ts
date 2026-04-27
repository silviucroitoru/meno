import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { SubmissionID, DataPointName, Response: userResponse } = await req.json();

    if (!SubmissionID || !DataPointName || !userResponse) {
      return new Response(
        JSON.stringify({ message: "Missing required parameters (SubmissionID, DataPointName, Response)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing, error: getError } = await supabase
      .from("submissions")
      .select("id, responses")
      .eq("id", SubmissionID)
      .single();

    if (getError || !existing) {
      return new Response(
        JSON.stringify({ message: `SubmissionID ${SubmissionID} not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const updatedResponses = { ...existing.responses, [DataPointName]: userResponse };

    const { error: updateError } = await supabase
      .from("submissions")
      .update({ responses: updatedResponses, last_updated: new Date().toISOString() })
      .eq("id", SubmissionID);

    if (updateError) {
      throw new Error(`Failed to update: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        message: "Response recorded successfully",
        SubmissionID,
        DataPointName,
        Response: userResponse,
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
