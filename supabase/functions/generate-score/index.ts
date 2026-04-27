import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const symptomWeights: Record<string, number> = {
  "Hot Flushes": 6, "Night Sweats": 6, "Sleep Problems": 6, "Irritability": 6,
  "Low Mood, Depression, Mood Swings": 6, "Anxiety": 6, "Memory Issues": 5, "Brain Fog": 5,
  "Joint Pain": 5, "Weight Gain": 5, "Palpitations": 5, "Vaginal Dryness": 5, "Bladder Problems": 4,
  "Declining Skin Quality": 4, "Declining Hair Quality": 4, "Loss of Interest in Sex": 4,
  "DigestiveSymptoms": 4, "Decreased Physical Strength/Stamina": 4, "Headaches": 4, "Tiredness & Fatigue": 4,
};

const symptomResponseMap: Record<string, number> = {
  "1": 0, "2": 0.25, "3": 0.50, "4": 1,
};

function calculateMenoScore(responses: Record<string, string | number>): number {
  const nonSymptomKeys = new Set(["FirstName", "BirthYear", "Height", "Weight", "Menstrual Status", "HRT Treatment History", "Email"]);
  let symptomsSum = 0;
  for (const [key, value] of Object.entries(responses)) {
    if (nonSymptomKeys.has(key)) continue;
    const numVal = Number(value);
    if (isNaN(numVal) || numVal < 1 || numVal > 4) continue;
    const weight = symptomWeights[key] || 4;
    const scaled = symptomResponseMap[numVal.toString()] || 0;
    symptomsSum += weight * scaled;
  }
  return Math.round(100 - symptomsSum);
}

function extractSymptoms(responses: Record<string, string | number>): Record<string, number> {
  const nonSymptomKeys = new Set(["FirstName", "BirthYear", "Height", "Weight", "Menstrual Status", "HRT Treatment History", "Email"]);
  const symptoms: Record<string, number> = {};
  for (const [key, value] of Object.entries(responses)) {
    if (nonSymptomKeys.has(key)) continue;
    const numVal = Number(value);
    if (!isNaN(numVal) && numVal >= 1 && numVal <= 4) {
      symptoms[key] = numVal;
    }
  }
  return symptoms;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const submissionId = url.searchParams.get("submissionId");
    const language = url.searchParams.get("language") || "EN";

    if (!submissionId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: submissionId." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", Number(submissionId))
      .single();

    if (subError || !submission) {
      return new Response(
        JSON.stringify({ error: "No menopause data found for this submission." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const responses = submission.responses || {};
    const symptoms = extractSymptoms(responses);
    const menopauseScore = calculateMenoScore(responses);

    const symptomList = Object.entries(symptoms)
      .map(([symptom, value]) => `- **${symptom.replace(/_/g, " ")}:** ${value}`)
      .join("\n");

    const prompt = `
      You are a menopause health expert. Generate a structured menopause report in **${language === "RO" ? "Romanian" : "English"}**.

      Make sure:
      - Your response is written in **${language === "RO" ? "Romanian" : "English"}** using native and natural expressions.
      - You will translate and adapt in **${language === "RO" ? "Romanian" : "English"}** all pre-defined values.
      - Do not translate DataPointName.
      - Use medical terms that are culturally appropriate.
      - Maintain a professional and empathetic tone.
      - Your responses must be:
        - Professional, concise, and easy to understand.
        - Empathetic and supportive, fostering trust and motivation.
        - Grounded in science.

        ## **1. Menopause Stage**
        - **Title (stagetitle)**:
          - If language is **EN**, use: "Menopause Stage"
          - If language is **RO**, use: "Faza Menopauzei"
        - **Stage (stage)**:
          - If language is **EN**, use: Premenopause, Perimenopause, Menopause, Postmenopause or Undefined.
          - If language is **RO**, use: Premenopauză, Perimenopauză, Menopauză, Postmenopauză or Nedefinită.
        - Determine the menopause stage based on **menstrual patterns, age, symptom severity, and HRT history**:
        - **Premenopause**: Regular menstrual cycles. Few or no menopause-related symptoms. No history of HRT use. Typically under 40 years old.
        - **Perimenopause**: Irregular periods (shorter/longer cycles, skipped months). Noticeable symptoms such as mood swings, hot flushes, or sleep disturbances. Typically between 40-50 years old.
        - **Menopause**: No period for the past **12 months**. Symptoms may still be present but menstrual cycles have ceased. Typically between 45-55 years old.
        - **Postmenopause**: No period for over **a year**. Symptoms may still persist or start fading. Typically **50+ years old**.
        - **HRT Consideration in Classification**:
          - If the user is **currently taking HRT**, menstrual patterns may be unreliable for classification.
          - If the user **previously took HRT but has stopped**, consider age and symptoms more strongly.
          - If the user **never took HRT**, prioritize menstrual patterns in classification.
        - **Classification Priority (Most Important to Least Important Factors)**:
          1. **Menstrual Patterns** (most important factor if not on HRT)
          2. **HRT History** (adjusts interpretation of menstrual patterns)
          3. **Age Consideration** (secondary factor)
          4. **Symptoms Severity & Frequency** (used for fine-tuning classification)
          - If **stage determination is uncertain**, state this clearly (Undefined) instead of forcing a classification.
      - **Description (500-800 chars)**:
        - Personalize using user's name and key symptoms.
        - Use <p></p> to separate paragraphs.
        - Include a personalized CTA paragraph at the end that encourages evrbloom membership conversion.
        - Keep the text links markdown as they are

        ## **2. Menopause Score**
        - Score: **${menopauseScore}** (100 - weighted symptom sum).
        - Higher = fewer symptoms, lower = higher impact.
        - Title (scoretitle): Provide in the same language as the user's questionnaire.
          - If language is **EN**, use: "Menopause Score"
          - If language is **RO**, use: "Scor Menopauză"
        - **Name (scorename) based on the score value**:
            Select only one based on the final score:
            - If score is under 30: EN: "Exhausting Menopause" / RO: "Menopauză epuizantă"
            - If score is 30-44: EN: "Difficult Menopause" / RO: "Menopauză dificilă"
            - If score is 45-59: EN: "Challenging Menopause" / RO: "Menopauză provocatoare"
            - If score is 60-79: EN: "Balanced Menopause" / RO: "Menopauză echilibrată"
            - If score is 80-100: EN: "Mild Menopause" / RO: "Menopauză ușoară"
        - **Description based on the score value without mentioning it (500-800 chars)**:
          - Personalize using user's name and key symptoms.
          - Use second-person voice (e.g., "you").
          - Use <p></p> to separate paragraphs.
          - Include a personalized CTA paragraph at the end that encourages evrbloom membership conversion.
          - Keep the text links markdown as they are

      ## **3. Key Symptoms & Insights**
      - **Title (symptomstitle)**: "Symptoms"
      - Identify all symptoms rated 2, 3, or 4, and categorize them based on severity:
        - **Most Impactful (Severity 3 or 4)**
        - **Moderate Impact (Severity 2)**
      - For each symptom, provide:
        - **DataPointName** - DataPointName
        - **Severity** (Integer between 2-4)
---
      User Data
      - Name: ${responses.FirstName}
      - Submission ID: ${submissionId}
      - Language: ${language}
      - Birth Year: ${responses.BirthYear}
      - Height: ${responses.Height} cm
      - Weight: ${responses.Weight} kg
      - MenstrualStatus: ${responses["Menstrual Status"]}
      - HRTTreatmentHistory: ${responses["HRT Treatment History"]}

      Symptom Responses
      ${symptomList}
---
      `;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that outputs only JSON when instructed. **Language Requirement:** All responses must be written in **${language === "RO" ? "Romanian" : "English"}**. Use natural expressions in this language. Ensure medical terms are culturally appropriate.`,
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "menoqueens_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                menoScore: {
                  type: "object",
                  properties: {
                    scoretitle: { type: "string" },
                    scorename: { type: "string" },
                    score: { type: "integer" },
                    description: { type: "string" },
                  },
                  required: ["score", "scoretitle", "scorename", "description"],
                  additionalProperties: false,
                },
                menopauseStage: {
                  type: "object",
                  properties: {
                    stagetitle: { type: "string" },
                    stage: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["stage", "stagetitle", "description"],
                  additionalProperties: false,
                },
                keySymptoms: {
                  type: "object",
                  properties: {
                    symptomstitle: { type: "string" },
                    mostImpactful: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          dataPointName: { type: "string" },
                          severity: { type: "integer" },
                        },
                        required: ["dataPointName", "severity"],
                        additionalProperties: false,
                      },
                    },
                    moderateImpact: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          dataPointName: { type: "string" },
                          severity: { type: "integer" },
                        },
                        required: ["dataPointName", "severity"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["symptomstitle", "mostImpactful", "moderateImpact"],
                  additionalProperties: false,
                },
              },
              required: ["menoScore", "menopauseStage", "keySymptoms"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI error:", openaiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "OpenAI API error", status: openaiResponse.status, detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiJson = await openaiResponse.json();
    const extractedMessage = openaiJson?.choices?.[0]?.message;

    if (!extractedMessage?.content) {
      console.error("Unexpected OpenAI response:", JSON.stringify(openaiJson));
      return new Response(
        JSON.stringify({ error: "Empty OpenAI response", raw: openaiJson }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contentOnly = extractedMessage.content;

    // Store the report
    await supabase.from("reports").upsert({
      submission_id: Number(submissionId),
      menopause_report: JSON.parse(contentOnly),
    });

    return new Response(JSON.stringify(extractedMessage), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-score error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
