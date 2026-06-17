import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Store birth year as 4 digits only (client may still send value+unit, e.g. "1985Godina"). */
function normalizeStoredResponse(dataPointName: string, response: unknown): unknown {
  if (typeof response !== "string" || !/^birthyear$/i.test(String(dataPointName).trim())) {
    return response;
  }
  const four = response.match(/\d{4}/);
  if (four) return four[0];
  const digits = response.replace(/\D/g, "");
  return digits.length ? digits.slice(0, 4) : response;
}

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

    const responseToStore = normalizeStoredResponse(DataPointName, userResponse);

    const { error: updateError } = await supabase.rpc("merge_contraception_submission_response", {
      p_submission_id: SubmissionID,
      p_key: DataPointName,
      p_value: responseToStore,
    });

    if (updateError?.code === "PGRST202" || updateError?.message?.includes("merge_contraception_submission_response")) {
      const { data: existing, error: getError } = await supabase
        .from("contraception_submissions")
        .select("id, responses")
        .eq("id", SubmissionID)
        .single();

      if (getError || !existing) {
        return new Response(
          JSON.stringify({ message: `SubmissionID ${SubmissionID} not found` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updatedResponses = { ...existing.responses, [DataPointName]: responseToStore };
      const { error: fallbackError } = await supabase
        .from("contraception_submissions")
        .update({ responses: updatedResponses, last_updated: new Date().toISOString() })
        .eq("id", SubmissionID);

      if (fallbackError) throw new Error(`Failed to update: ${fallbackError.message}`);
    } else if (updateError) {
      if (updateError.code === "P0001" && updateError.message?.includes("not found")) {
        return new Response(
          JSON.stringify({ message: `SubmissionID ${SubmissionID} not found` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Failed to update: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        message: "Response recorded successfully",
        SubmissionID,
        DataPointName,
        Response: responseToStore,
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
