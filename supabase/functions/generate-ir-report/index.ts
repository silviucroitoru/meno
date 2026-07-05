import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { computeIRResult } from "./logic.ts";
import type { IRZone } from "./logic.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const ZONE_COPY: Record<IRZone, { title: string; body: string; benefits: string }> = {
  green: {
    title: "Stabilan metabolizam i nizak rizik",
    body: "Sjajne vesti! Vaši odgovori pokazuju da vaše telo trenutno uspešno balansira nivo šećera i insulina u krvi. Čak i ako povremeno osećate pad energije ili promenu raspoloženja, prema ovom testu uzrok verovatno leži u trenutnom umoru, stresu ili nedostatku sna, a ne u metaboličkom poremećaju. Vaš obim struka i opšte navike ukazuju na to da ste na dobrom putu.\n\nKako biste zadržali ovaj nivo energije i dugoročno zaštitili svoj metabolizam, nastavite sa održavanjem zdravih navika. Ipak, pošto zdravlje zahteva preventivu, ako u porodici imate istoriju dijabetesa ili jednostavno želite da proverite sitne detalje u laboratoriji, podsećamo vas da ste popunjavanjem ovog upitnika ostvarili 10% popusta na laboratorijske analize i metaboličke pakete u Poliklinici Primea.",
    benefits: '<ul style="margin:0;padding-left:20px;"><li>10% popusta na laboratorijske analize i metaboličke pakete u Poliklinici Primea</li></ul>',
  },
  yellow: {
    title: "Vaše telo šalje prve signale (Blago povećan rizik)",
    body: "Vaš rezultat pokazuje da se vaš metabolizam trenutno bori da održi zlatnu ravnotežu. Odgovori koji se odnose na učestalu glad nakon obroka, jaku želju za slatkišima ili umereno nakupljanje masnih naslaga oko struka, najčešće su rani znaci početne insulinske rezistencije. Telo vam suptilno poručuje da mu je potrebna mala promena u ritmu kako se ovi simptomi ne bi razvili u hronični problem.\n\nDobra vest je da je ovo stanje potpuno promenljivo — pravovremenom korekcijom ishrane, uvođenjem lagane fizičke aktivnosti i preventivnim pregledom možete brzo vratiti energiju u normalu. Kako ne biste lutale same kroz dijete i pretrage, iskoristite pogodnost koju ste dobili: zakažite besplatne petominutne telefonske konsultacije sa našim lekarom. Razgovor će vam pomoći da tačno razumete koje analize treba da uradite i koji su vaši sledeći koraci.",
    benefits: '<ul style="margin:0;padding-left:20px;"><li>Besplatne petominutne konsultacije sa našim lekarima</li><li>30% popusta na pregled endokrinologa</li><li>10% popusta na endokrinološki paket</li><li>10% popusta na laboratorijske usluge</li></ul>',
  },
  red: {
    title: "Vreme je za proaktivnu brigu o telu (Visok rizik)",
    body: "Vaši odgovori, a posebno laboratorijski parametri koje ste uneli i/ili izraženi fizički simptomi jasno ukazuju na visok rizik od izražene insulinske rezistencije ili predijabetesa. Želimo da znate da ovi simptomi i stagnacija u kilaži nisu vaša krivica, već posledica ozbiljnog metaboličkog disbalansa sa kojim se vaš organizam trenutno bori.\n\nU ovoj fazi, same promene u ishrani i treninzima najčešće nisu dovoljne. Potrebna vam je stručna, lekarska podrška kako biste bezbedno preokrenuli ovaj proces i sprečili dalji razvoj ka dijabetesu tipa 2 ili težim hormonskim poremećajima. Nemojte odlagati brigu o sebi. Kao odgovor na vaše poverenje, Poliklinika Primea vam obezbeđuje 30% popusta na endokrinološki pregled i 10% popusta na prateću laboratoriju. Zakažite svoj termin već danas i dozvolite našem timu endokrinologa da vas bezbedno vrati u balans.",
    benefits: '<ul style="margin:0;padding-left:20px;"><li>30% popusta na endokrinološki pregled</li><li>10% popusta na prateću laboratoriju</li></ul>',
  },
};

async function sendIREmail(
  email: string,
  firstName: string,
  submissionId: number,
  zone: IRZone,
  score: number,
): Promise<string | null> {
  const apiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping IR email");
    return null;
  }

  const from = Deno.env.get("RESEND_FROM_EMAIL")?.trim() || "Primea <noreply@primea.rs>";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/+$/, "") ?? "";
  const trackBase = `${supabaseUrl}/functions/v1/track-email-click`;
  const consultationUrl = `${trackBase}?sid=${submissionId}&btn=consultation&src=ir`;
  const checkupUrl = `${trackBase}?sid=${submissionId}&btn=checkup&src=ir`;

  const templateId = "7d2cdeaa-d6ec-4771-959c-db5c681946e8";
  const copy = ZONE_COPY[zone];

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
      tags: [
        { name: "submission_id", value: String(submissionId) },
        { name: "type", value: "ir" },
      ],
      template: {
        id: templateId,
        variables: {
          ZONE_TITLE: copy.title,
          ZONE_BODY: copy.body.replace(/\n/g, "<br />"),
          SCORE: String(score),
          BENEFITS_HTML: copy.benefits,
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
      .from("ir_submissions")
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

    const { score, normalizedScore, zone, forcedRed } = computeIRResult(responses);

    // Email sending paused for now
    // TODO: re-enable once email template is updated

    return new Response(
      JSON.stringify({ score, normalizedScore, zone, forcedRed, firstName }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("generate-ir-report error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
