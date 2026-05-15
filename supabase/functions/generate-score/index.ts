import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildMenopauseReportPdfHtml,
  resolvePdfLang,
  type MenopauseReportPdf,
} from "./pdf-html.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

/** EN / RO / SR only — defaults to EN for unexpected values */
function normalizeReportLanguage(lang: string | null | undefined): string {
  const u = (lang ?? "EN").toString().trim().toUpperCase();
  if (u === "RO" || u === "SR" || u === "EN") return u;
  return "EN";
}

/** Same JSON shape OpenAI branch returns (`content` must be JSON string of report) */
function dashboardReportResponse(reportObj: MenopauseReportPdf, pdfUrl: string | null): Response {
  const body = {
    role: "assistant" as const,
    content: JSON.stringify(reportObj),
    pdf_url: pdfUrl,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const symptomWeights: Record<string, number> = {
  "Hot Flushes": 6, "Night Sweats": 6, "Sleep Problems": 6, "Irritability": 6,
  "Low Mood, Depression, Mood Swings": 6, "Anxiety": 6, "Memory Issues": 5, "Brain Fog": 5,
  "Joint Pain": 5, "Weight Gain": 5, "Palpitations": 5, "Vaginal Dryness": 5, "Bladder Problems": 4,
  "Declining Skin Quality": 4, "Declining Hair Quality": 4, "Loss of Interest in Sex": 4,
  "DigestiveSymptoms": 4,
  "Decreased Physical Strength/Stamina": 4,
  "Decreased Physical Strength or Stamina": 4,
  "Headaches": 4, "Tiredness & Fatigue": 4,
};

const symptomResponseMap: Record<string, number> = {
  "1": 0, "2": 0.25, "3": 0.50, "4": 1,
};

/** Same rule as legacy Lambda: only keys listed in `symptomWeights` contribute. */
function isWeightedSymptomKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(symptomWeights, key);
}

function calculateMenoScore(responses: Record<string, string | number>): number {
  let symptomsSum = 0;
  for (const [key, value] of Object.entries(responses)) {
    if (!isWeightedSymptomKey(key)) continue;
    const numVal = Number(value);
    if (isNaN(numVal) || numVal < 1 || numVal > 4) continue;
    const weight = symptomWeights[key] || 4;
    const scaled = symptomResponseMap[numVal.toString()] || 0;
    symptomsSum += weight * scaled;
  }
  return Math.round(100 - symptomsSum);
}

function extractSymptoms(responses: Record<string, string | number>): Record<string, number> {
  const symptoms: Record<string, number> = {};
  for (const [key, value] of Object.entries(responses)) {
    if (!isWeightedSymptomKey(key)) continue;
    const numVal = Number(value);
    if (!isNaN(numVal) && numVal >= 1 && numVal <= 4) {
      symptoms[key] = numVal;
    }
  }
  return symptoms;
}

/** Full questionnaire: email step done + identity + almost all symptom scales (allows rare missed saves). */
const MIN_SYMPTOM_RESPONSES_FOR_REPORT = 18;

function isSubmissionCompleteForReport(responses: Record<string, string | number>): boolean {
  const email = String(responses.Email ?? "").trim();
  const firstName = String(responses.FirstName ?? "").trim();
  if (!email || !firstName) return false;
  const n = Object.keys(extractSymptoms(responses)).length;
  return n >= MIN_SYMPTOM_RESPONSES_FOR_REPORT;
}

async function generatePdfWithApi2Pdf(html: string, apiKey: string): Promise<string> {
  const res = await fetch("https://v2.api2pdf.com/chrome/html", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      html,
      inlinePdf: false,
      fileName: "menopause-report.pdf",
      options: {
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
        viewport: { width: 1280, height: 1024, isMobile: false, deviceScaleFactor: 2 },
      },
    }),
  });
  const json = await res.json();
  if (!json?.success) {
    throw new Error(typeof json?.error === "string" ? json.error : JSON.stringify(json));
  }
  return json.pdf as string;
}

async function downloadPdfBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download PDF from API2PDF: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

const PDF_BUCKET = "menopause-reports";

/** Vite `public/primea_repor.png` → `https://<origin>/primea_repor.png` */
const PDF_BANNER_PUBLIC_PATH = "/primea_repor.png";
const LEGACY_PDF_BANNER =
  "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/pdf-banner.png?v=1746428932";

/** `PDF_REPORT_BANNER_URL` full URL, or `PUBLIC_SITE_URL` / `SITE_URL` + public path, else legacy CDN. */
function resolvePdfBannerSrc(): string {
  const explicit = Deno.env.get("PDF_REPORT_BANNER_URL")?.trim();
  if (explicit) return explicit;
  const origin = Deno.env.get("PUBLIC_SITE_URL")?.trim() ||
    Deno.env.get("SITE_URL")?.trim();
  if (origin) {
    return `${origin.replace(/\/+$/, "")}${PDF_BANNER_PUBLIC_PATH}`;
  }
  return LEGACY_PDF_BANNER;
}

async function sendReportReadyEmail(
  email: string,
  firstName: string | undefined,
  submissionId: number,
  language: string,
): Promise<string | null> {
  const apiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping report email");
    return null;
  }

  const from = Deno.env.get("RESEND_FROM_EMAIL")?.trim() || "Primea <noreply@primea.rs>";
  const displayName = firstName?.trim() || "there";
  const origin = Deno.env.get("PUBLIC_SITE_URL")?.trim() ||
    Deno.env.get("SITE_URL")?.trim() ||
    "https://menopause.primea.rs";
  const dashboardParams = new URLSearchParams({
    submissionId: String(submissionId),
    language: normalizeReportLanguage(language).toLowerCase(),
  });
  const dashboardUrl = `${origin.replace(/\/+$/, "")}/dashboard?${dashboardParams.toString()}`;

  const langNorm = normalizeReportLanguage(language);
  const subject = langNorm === "SR"
    ? `${displayName}, Vaš izveštaj je spreman.`
    : `${displayName}, Your Menoscore report is ready`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      tags: [{ name: "submission_id", value: String(submissionId) }],
      template: {
        id: "primea-report",
        variables: {
          NAME: displayName,
          RECIPIENT_EMAIL: email,
          DASHBOARD_URL: dashboardUrl,
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

async function generateAndStorePdf(
  supabase: ReturnType<typeof createClient>,
  submissionId: number,
  report: MenopauseReportPdf,
  language: string,
): Promise<string | null> {
  const apiKey = Deno.env.get("API2PDF_API_KEY");
  if (!apiKey?.trim()) {
    console.warn("API2PDF_API_KEY not set; skipping PDF generation");
    return null;
  }
  const lang = resolvePdfLang(language);
  const html = buildMenopauseReportPdfHtml(report, lang, resolvePdfBannerSrc());
  const tempPdfUrl = await generatePdfWithApi2Pdf(html, apiKey);
  const bytes = await downloadPdfBytes(tempPdfUrl);
  const path = `${submissionId}/report.pdf`;
  const { error: uploadError } = await supabase.storage.from(PDF_BUCKET).upload(path, bytes, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const submissionId = url.searchParams.get("submissionId");
    const language = normalizeReportLanguage(url.searchParams.get("language"));
    const forceRegenerateRaw = (
      url.searchParams.get("regenerate") ??
      url.searchParams.get("forceRegenerate") ??
      ""
    ).toLowerCase();
    const forceRegenerate = ["1", "true", "yes"].includes(forceRegenerateRaw);

    const outputLanguage =
      language === "RO" ? "Romanian" : language === "SR" ? "Serbian" : "English";
    const symptomsTitle =
      language === "RO" ? "Simptome" : language === "SR" ? "Simptomi" : "Symptoms";

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

    const responsesEarly = (submission.responses || {}) as Record<string, string | number>;
    if (!isSubmissionCompleteForReport(responsesEarly)) {
      return new Response(
        JSON.stringify({
          error:
            "Questionnaire not completed for this submission. Finish all steps or use the link from your confirmation email.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!forceRegenerate) {
      const submissionLangNorm = normalizeReportLanguage(
        submission.language as string | undefined,
      );

      const { data: existingReport } = await supabase
        .from("reports")
        .select("menopause_report, pdf_url, created_at")
        .eq("submission_id", Number(submissionId))
        .maybeSingle();

      const cached = existingReport?.menopause_report as MenopauseReportPdf | null | undefined;
      const reportCreatedAt = existingReport?.created_at as string | undefined;
      const lastUpdated = submission.last_updated as string | null | undefined;

      const submissionNotEditedAfterReport =
        !reportCreatedAt ||
        !lastUpdated ||
        new Date(lastUpdated).getTime() <= new Date(reportCreatedAt).getTime();

      if (
        cached &&
        language === submissionLangNorm &&
        submissionNotEditedAfterReport
      ) {
        return dashboardReportResponse(cached, existingReport?.pdf_url ?? null);
      }
    }

    const responses = submission.responses || {};
    const symptoms = extractSymptoms(responses);
    const menopauseScore = calculateMenoScore(responses);

    const symptomList = Object.entries(symptoms)
      .map(([symptom, value]) => `- **${symptom.replace(/_/g, " ")}:** ${value}`)
      .join("\n");

    const prompt = `
      You are a menopause health expert. Generate a structured menopause report in **${outputLanguage}**.

      Make sure:
      - Your response is written in **${outputLanguage}** using native and natural expressions.
      - You will translate and adapt in **${outputLanguage}** all pre-defined values.
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
          - If language is **SR**, use: "Faza menopauze"
        - **Stage (stage)**:
          - If language is **EN**, use: Premenopause, Perimenopause, Menopause, Postmenopause or Undefined.
          - If language is **RO**, use: Premenopauză, Perimenopauză, Menopauză, Postmenopauză or Nedefinită.
          - If language is **SR**, use: Premenopauza, Perimenopauza, Menopauza, Postmenopauza or Neodređeno.
        - Determine the menopause stage based on **menstrual patterns, age, symptom severity, and HRT history**:
        - **Premenopause**: Regular menstrual cycles. Few or no menopause-related symptoms. No history of HRT use. Typically under 40 years old.
        - **Perimenopause**: Irregular periods (shorter/longer cycles, skipped months). Noticeable symptoms such as mood swings, hot flushes, or sleep disturbances. Typically between 40-50 years old.
        - **Menopause**: Periods have stopped for several months and up to around 12 months, or the user reports no period for one year or more but age, HRT history, and symptom profile suggest an active menopause transition. Typically between 45-55 years old.
        - **Postmenopause**: Periods have stopped for one year or more and the user is likely beyond the active menopause transition. Use this stage when the user is typically 55 years old or older, or when age, HRT history, and symptom profile strongly suggest a later postmenopausal phase.
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
      - **Description (800-1600 chars)**:
        - Personalize using user's name and key symptoms.
        - Use <p></p> to separate paragraphs.
        - Example: "<p>{FirstName}, based on your symptoms and age, you're most likely in the {menopause_stage} phase. This stage is marked by fluctuating hormones that can impact your mood, sleep, energy, and cognitive clarity, even if your menstrual cycle hasn't fully stopped yet. It's often unpredictable, with symptoms that vary from week to week.</p><p>At {age}, your body is navigating significant hormonal changes. Many women in this stage experience heightened sensitivity, more emotional ups and downs, and challenges with memory, libido, or physical stamina.</p><p>In the coming months, you may notice phases of symptom relief followed by new waves of discomfort. That's normal, the transition is rarely linear. Some signs may improve naturally, while others might intensify before settling down.</p><p>Understanding what's happening and knowing what to expect is one of the most empowering things during this phase. Proper information and professional support can help you feel more in control and better prepared.</p>"

        ## **2. Menopause Score**
        - Score: **${menopauseScore}** (100 - weighted symptom sum).
        - Higher = fewer symptoms, lower = higher impact.
        - Title (scoretitle): Provide in the same language as the user's questionnaire.
          - If language is **EN**, use: "Menopause Score"
          - If language is **RO**, use: "Scor Menopauză"
          - If language is **SR**, use: "Menopauzni skor"
        - **Name (scorename) based on the score value**:
            Select exactly one label in the same language as \`language\`:
            - If score is under 30:
              - EN: "Exhausting Menopause"
              - RO: "Menopauză epuizantă"
              - SR: "Iscrpljujuća menopauza"
            - If score is 30-44:
              - EN: "Difficult Menopause"
              - RO: "Menopauză dificilă"
              - SR: "Teška menopauza"
            - If score is 45-59:
              - EN: "Challenging Menopause"
              - RO: "Menopauză provocatoare"
              - SR: "Izazovna menopauza"
            - If score is 60-79:
              - EN: "Balanced Menopause"
              - RO: "Menopauză echilibrată"
              - SR: "Uravnotežena menopauza"
            - If score is 80-100:
              - EN: "Mild Menopause"
              - RO: "Menopauză ușoară"
              - SR: "Blaga menopauza"
        - **Description based on the score value without mentioning it (800-1600 chars)**:
          - Personalize using user's name and key symptoms.
          - Use second-person voice (e.g., "you").
          - Use <p></p> to separate paragraphs.
          - Example: "<p>{FirstName}, your Menopause Score indicates that you're experiencing a challenging menopause journey. Symptoms like anxiety, headaches, and irritability may be disrupting your sleep, mood, and daily energy.</p><p>At {age}, compared to other women in {menopause_stage}, your symptom impact is on the moderate to high end, especially around emotional regulation and mental clarity.</p><p>Focusing on one or two key symptoms can help unlock better balance. Supporting your nervous system with consistent sleep, gentle movement, and stabilizing nutrition can make a noticeable difference.</p><p>Most women in this stage experience the same challenges. Professional guidance, personalized tools, and the right information can help you navigate this transition with more confidence and comfort.</p>"

      ## **3. Key Symptoms & Insights**
      - **Title (symptomstitle)**: "${symptomsTitle}"
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
      - Height: ${responses.Height}
      - Weight: ${responses.Weight}
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
        model: "gpt-4.1",
        temperature: 0.7,
        store: true,
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that outputs only JSON when instructed. **Language Requirement:** All responses must be written in **${outputLanguage}**. Use natural expressions in this language. Ensure medical terms are culturally appropriate.`,
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
    const reportObj = JSON.parse(contentOnly) as MenopauseReportPdf;

    // Enforce the deterministic Lambda-style score: OpenAI sometimes hallucinates
    // a different integer for `menoScore.score`. The actual score is computed
    // from `symptomWeights` * `symptomResponseMap` and must not be overwritten by the model.
    if (reportObj?.menoScore) {
      reportObj.menoScore.score = menopauseScore;
    }

    await supabase.from("reports").upsert({
      submission_id: Number(submissionId),
      menopause_report: reportObj,
    });

    const langForPdf = (submission.language as string | undefined) || language;

    let pdfUrl: string | null = null;
    const pdfDisabled = ["1", "true", "yes"].includes(
      (Deno.env.get("DISABLE_PDF_GENERATION") ?? "").trim().toLowerCase(),
    );
    if (pdfDisabled) {
      console.log("PDF generation disabled via DISABLE_PDF_GENERATION env var");
    } else {
      try {
        pdfUrl = await generateAndStorePdf(
          supabase,
          Number(submissionId),
          reportObj,
          langForPdf,
        );
      } catch (pdfErr) {
        console.error("PDF generation or storage failed:", pdfErr);
      }
    }

    if (pdfUrl) {
      const { error: pdfUpdateError } = await supabase
        .from("reports")
        .update({ pdf_url: pdfUrl })
        .eq("submission_id", Number(submissionId));
      if (pdfUpdateError) console.error("Failed to persist pdf_url:", pdfUpdateError);
    }

    const email = String(responses.Email ?? "").trim();
    if (email) {
      try {
        const resendEmailId = await sendReportReadyEmail(
          email,
          typeof responses.FirstName === "string" ? responses.FirstName : undefined,
          Number(submissionId),
          langForPdf,
        );
        const { error: emailStatusErr } = await supabase.from("submission_email_status").upsert({
          submission_id: Number(submissionId),
          resend_email_id: resendEmailId,
          last_event: "email.sent",
          last_event_at: new Date().toISOString(),
        });
        if (emailStatusErr) console.error("Failed to persist submission_email_status:", emailStatusErr);
      } catch (emailErr) {
        console.error("Failed to send report email:", emailErr);
      }
    } else {
      console.warn("Submission has no email; skipping report email");
    }

    return dashboardReportResponse(reportObj, pdfUrl);
  } catch (error) {
    console.error("generate-score error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
