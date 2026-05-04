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

export type MenopauseReportPdf = {
  menopauseStage?: { stage?: string; description?: string };
  menoScore?: { score?: number; scorename?: string; description?: string };
  keySymptoms?: {
    mostImpactful?: { dataPointName: string; severity: number }[];
    moderateImpact?: { dataPointName: string; severity: number }[];
  };
};

export function buildMenopauseReportPdfHtml(report: MenopauseReportPdf, lang: PdfLang): string {
  const t = messages(lang);
  const stage = report.menopauseStage?.stage ?? "";
  const stageImageUrl = getStageImageUrl(stage);
  const score = Number(report.menoScore?.score ?? 0);

  const allSymptoms = [
    ...(report.keySymptoms?.mostImpactful ?? []),
    ...(report.keySymptoms?.moderateImpact ?? []),
  ];

  const memberLink = t["become_member_link"] ?? "https://evrbloom.ro/products/abonament-evrbloom";
  const talkLabel = t["talk_to_doctor"] ?? "Chat with a doctor";
  const symptomMoreLabel = t["symptom_link_text"] ?? "Read more";

  const symptomHtmlBlocks = allSymptoms.map((symptom, index) => {
    const base = getSymptomBaseId(symptom.dataPointName);
    const name = t[`${base}_name`];
    const description = t[`${base}_description`];
    const link = t[`${base}_link`];
    if (!name || !description || !link) return "";
    return `<div class="symptom" id="symptom_${index}">
      <div class="symptom-name">${escapeHtml(name)}</div>
      <div class="symptom-description">${description}</div>
      <div class="symptom-actions">
        <a href="${escapeHtml(memberLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${escapeHtml(talkLabel)}</a>
        <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">${escapeHtml(symptomMoreLabel)}</a>
      </div>
    </div>`;
  }).join("\n");

  const stageDesc = convertMarkdownLinksToHtml(report.menopauseStage?.description ?? "");
  const scoreDesc = convertMarkdownLinksToHtml(report.menoScore?.description ?? "");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Menopause report</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #1a1a2e; margin: 0; padding: 32px; background: #f7f8fc; }
    .card { background: #fff; border-radius: 16px; padding: 28px; margin-bottom: 24px; box-shadow: 0 4px 24px rgba(61, 73, 122, 0.08); }
    h1 { font-size: 22px; margin: 0 0 8px; color: #3d497a; }
    .stage-row { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
    .stage-img { max-width: 200px; border-radius: 12px; }
    .stage-text { flex: 1; min-width: 220px; }
    .stage-text p { margin: 0 0 12px; line-height: 1.55; }
    .score-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px; }
    .score-name { font-size: 18px; font-weight: 600; color: #3d497a; }
    .score-num { font-size: 42px; font-weight: 700; color: #3d497a; }
    .score-bar { height: 8px; background: #e8eaf4; border-radius: 4px; margin: 16px 0; overflow: hidden; }
    .score-bar-inner { height: 100%; background: linear-gradient(90deg, #7c8bc4, #3d497a); border-radius: 4px; width: ${score}%; max-width: 100%; }
    .score-desc p { margin: 0 0 12px; line-height: 1.55; }
    a { color: #3d497a; }
    .symptom { border-top: 1px solid #e8eaf4; padding: 20px 0; }
    .symptom:first-of-type { border-top: none; padding-top: 0; }
    .symptom-name { font-weight: 600; font-size: 17px; color: #3d497a; margin-bottom: 10px; }
    .symptom-description { line-height: 1.55; margin-bottom: 14px; }
    .symptom-description p { margin: 0 0 10px; }
    .symptom-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn { display: inline-block; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .btn-primary { background: #3d497a; color: #fff !important; }
    .btn-secondary { background: #fff; color: #3d497a !important; border: 2px solid #3d497a; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(stage)}</h1>
    <div class="stage-row">
      <img class="stage-img" src="${escapeHtml(stageImageUrl)}" alt="" width="200" height="200" />
      <div class="stage-text">${stageDesc}</div>
    </div>
  </div>
  <div class="card">
    <div class="score-header">
      <span class="score-name">${escapeHtml(report.menoScore?.scorename ?? "")}</span>
      <span class="score-num">${escapeHtml(String(score))}</span>
    </div>
    <div class="score-bar"><div class="score-bar-inner"></div></div>
    <div class="score-desc">${scoreDesc}</div>
  </div>
  <div class="card">
    ${symptomHtmlBlocks || `<p>${escapeHtml(lang === "en" ? "No key symptoms in this range." : lang === "ro" ? "Fără simptome cheie în acest interval." : "Nema ključnih simptoma u ovom opsegu.")}</p>`}
  </div>
</body>
</html>`;
}
