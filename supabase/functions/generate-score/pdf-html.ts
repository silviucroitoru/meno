import en from "./locales/en.json" with { type: "json" };
import ro from "./locales/ro.json" with { type: "json" };
import sr from "./locales/sr.json" with { type: "json" };

const bundles = { en, ro, sr } as const;
export type PdfLang = keyof typeof bundles;

export function resolvePdfLang(language: string): PdfLang {
  const l = language.toLowerCase();
  if (l === "ro" || l === "sr") return l;
  return "en";
}

function messages(lang: PdfLang): Record<string, string> {
  return bundles[lang] as Record<string, string>;
}

function getSymptomBaseId(dataPointName: string): string {
  return (dataPointName ?? "").replaceAll(" ", "").replaceAll("_", "");
}

export function convertMarkdownLinksToHtml(text: string): string {
  if (!text) return "";
  return text.replace(
    /\[([^\[\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STAGE_IMAGES: Record<string, string> = {
  Premenopauză: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Premenopauza.png",
  Perimenopauză: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Perimenopauza.png",
  Menopauză: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Menopauza.png",
  Postmenopauză: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Postmenopauza.png",
  Nedefinită: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Nedefinita.png",
  Premenopause: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Premenopauza.png",
  Perimenopause: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Perimenopauza.png",
  Menopause: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Menopauza.png",
  Postmenopause: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Postmenopauza.png",
  Undefined: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Nedefinita.png",
  Premenopauza: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Premenopauza.png",
  Perimenopauza: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Perimenopauza.png",
  Menopauza: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Menopauza.png",
  Postmenopauza: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Postmenopauza.png",
  Neodređeno: "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/Nedefinita.png",
};

function getStageImageUrl(stage: string): string {
  return STAGE_IMAGES[stage] ??
    "https://cdn.shopify.com/s/files/1/0799/1132/1784/files/default.png?v=123";
}

const SVG_PULSE = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12H18L15 21L9 3L6 12H2" stroke="#3D497A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

import { REPORT_HTML_TEMPLATE } from "./report-template.ts";

export type MenopauseReportPdf = {
  menopauseStage?: { stagetitle?: string; stage?: string; description?: string };
  menoScore?: { scoretitle?: string; score?: number; scorename?: string; description?: string };
  keySymptoms?: {
    symptomstitle?: string;
    mostImpactful?: { dataPointName: string; severity: number }[];
    moderateImpact?: { dataPointName: string; severity: number }[];
  };
};

function resolveStageKey(stage: string): string {
  const n = stage.toLowerCase().normalize("NFKC");
  if (n.includes("premenop")) return "premenopause";
  if (n.includes("perimenop")) return "perimenopause";
  if (n.includes("postmenop")) return "postmenopause";
  if (n.includes("menop")) return "menopause";
  return "menopause";
}

/** Legacy Lambda used 377 for dashoffset math (see generateMenoPdf). */
function scoreProgressOffset(score: number): string {
  const s = Math.max(0, Math.min(100, score));
  return String(377 - (s / 100) * 377);
}

function buildSymptomsSection(
  report: MenopauseReportPdf,
  lang: PdfLang,
): string {
  const t = messages(lang);
  const allSymptoms = [
    ...(report.keySymptoms?.mostImpactful ?? []),
    ...(report.keySymptoms?.moderateImpact ?? []),
  ];
  return allSymptoms.map((symptom, index) => {
    const base = getSymptomBaseId(symptom.dataPointName);
    const name = t[`${base}_name`];
    const description = t[`${base}_description`];
    if (!name || !description) return "";
    return `<div class="symptom high symptom${index}" id="symptom_pdf_${index}">
        <div class="name">
        ${SVG_PULSE}
          ${escapeHtml(name)}
        </div>
        <div class="description">${description}</div>
      </div>`;
  }).join("\n");
}

export function buildMenopauseReportPdfHtml(
  report: MenopauseReportPdf,
  lang: PdfLang,
  pdfBannerSrc: string,
): string {
  const t = messages(lang);
  const stage = report.menopauseStage?.stage ?? "";
  const score = Number(report.menoScore?.score ?? 0);
  const template = REPORT_HTML_TEMPLATE;
  const symptoms = buildSymptomsSection(report, lang);

  const stageKey = resolveStageKey(stage);
  const memberLink = t["become_member_link"] ?? "https://evrbloom.ro/products/abonament-evrbloom";

  return template
    .replaceAll("{{PDF_BANNER_SRC}}", escapeHtml(pdfBannerSrc))
    .replaceAll("{{STAGE}}", escapeHtml(stage))
    .replaceAll("{{STAGE_IMAGE_URL}}", escapeHtml(getStageImageUrl(stage)))
    .replaceAll("{{STAGE_DESCRIPTION}}", convertMarkdownLinksToHtml(report.menopauseStage?.description ?? ""))
    .replaceAll("{{SCORE}}", escapeHtml(String(score)))
    .replaceAll("{{SCORE_PROGRESS}}", scoreProgressOffset(score))
    .replaceAll("{{SCORENAME}}", escapeHtml(report.menoScore?.scorename ?? ""))
    .replaceAll("{{SCORE_DESCRIPTION}}", convertMarkdownLinksToHtml(report.menoScore?.description ?? ""))
    .replaceAll("{{SYMPTOMS_SECTION}}", symptoms)
    // Sidebar
    .replaceAll("{{PDF_SIDEBAR_SUMMARY}}", escapeHtml(t["pdf_sidebar_summary"] ?? "Summary"))
    .replaceAll("{{PDF_STAGE_LABEL}}", escapeHtml(t["pdf_stage_label"] ?? "Menopause Stage"))
    .replaceAll("{{PDF_SCORE_LABEL}}", escapeHtml(t["pdf_score_label"] ?? "Menopause Score"))
    .replaceAll("{{PDF_SYMPTOMS_LABEL}}", escapeHtml(t["pdf_symptoms_label"] ?? "Symptoms"))
    .replaceAll("{{WHATS_NEXT_SIDEBAR}}", escapeHtml(t["whats_next_sidebar_title"] ?? "What's next"))
    .replaceAll("{{BOOK_CALL_SIDEBAR}}", escapeHtml(t["book_call_sidebar_title"] ?? "Book consultation"))
    // Buttons & links
    .replaceAll("{{BECOME_MEMBER_LINK}}", escapeHtml(memberLink))
    .replaceAll("{{BECOME_MEMBER_LABEL}}", escapeHtml(t["become_member"] ?? "Ask a specialist"))
    .replaceAll("{{LEARN_ABOUT_STAGE_LABEL}}", escapeHtml(t["learn_about_stage"] ?? "Learn more about this stage"))
    .replaceAll("{{STAGE_LINK}}", escapeHtml(t[`${stageKey}_link`] ?? memberLink))
    .replaceAll("{{DISCOVER_MEMBERSHIP_LABEL}}", escapeHtml(t["discover_membership_textlink"] ?? "Discover the membership"))
    // Explanations & static text
    .replaceAll("{{STAGE_EXPLANATION}}", t["menopause_stage_determination"] ?? "")
    .replaceAll("{{SCORE_EXPLANATION}}", t["score_explanation"] ?? "")
    .replaceAll("{{MY_SCORE_LABEL}}", escapeHtml(t["my_score"] ?? "My score"))
    // Stage-dependent stats
    .replaceAll("{{STAGE_PERCENTAGE}}", escapeHtml(t[`${stageKey}_percentage`] ?? "87%"))
    .replaceAll("{{STAGE_INSIGHTS}}", escapeHtml(t[`${stageKey}_insights`] ?? ""))
    // Symptoms header
    .replaceAll("{{SYMPTOMS_TITLE}}", escapeHtml(t["symptomsTitle"] ?? "Your symptoms explained"))
    .replaceAll("{{SYMPTOMS_INTRO}}", escapeHtml(t["symptomsDescription"] ?? ""));
}
