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

const SVG_ARROW = `<svg width="16" height="16" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66602 9.99996H16.3327M16.3327 9.99996L10.4993 4.16663M16.3327 9.99996L10.4993 15.8333" stroke="#3D497A" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

function whatsappSvg(clipId: string): string {
  return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#${clipId})"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.0859 2.90417C15.2061 1.03232 12.7059 0.000949696 10.042 0C4.55283 0 0.08547 4.44221 0.08356 9.90249C0.082605 11.648 0.54147 13.3518 1.41288 14.8533L0 19.9854L5.27909 18.6083C6.7335 19.3976 8.37128 19.813 10.0377 19.8135H10.042C15.5302 19.8135 19.9981 15.3708 20 9.91055C20.0009 7.26425 18.9662 4.7765 17.0859 2.90465V2.90417ZM10.042 18.1411H10.0387C8.55367 18.1407 7.09689 17.7436 5.82583 16.9939L5.52357 16.8154L2.39078 17.6325L3.22686 14.5949L3.03013 14.2834C2.20169 12.9729 1.76383 11.4581 1.76479 9.90298C1.7667 5.36484 5.47963 1.67241 10.0454 1.67241C12.2561 1.67336 14.3342 2.53047 15.8969 4.08655C17.4598 5.64216 18.3197 7.71061 18.3188 9.90961C18.3168 14.4482 14.6039 18.1407 10.042 18.1407V18.1411ZM14.5819 11.9766C14.3332 11.8527 13.1099 11.2544 12.8816 11.1718C12.6534 11.0891 12.4877 11.0478 12.322 11.2957C12.1563 11.5436 11.6793 12.1011 11.5342 12.2658C11.389 12.4311 11.2438 12.4515 10.9951 12.3275C10.7463 12.2036 9.94461 11.9424 8.99395 11.0996C8.25433 10.4433 7.75483 9.63326 7.60972 9.38536C7.46456 9.13751 7.59444 9.00359 7.71856 8.88061C7.83028 8.7695 7.96733 8.59144 8.09194 8.44707C8.21661 8.30271 8.25767 8.19923 8.34072 8.03442C8.42383 7.86917 8.38228 7.72486 8.32022 7.60088C8.25811 7.47696 7.76061 6.25895 7.55289 5.7637C7.35089 5.28127 7.14561 5.3468 6.99328 5.33872C6.84811 5.3316 6.68244 5.33018 6.51628 5.33018C6.35011 5.33018 6.08078 5.39191 5.85256 5.63978C5.62433 5.88762 4.98162 6.48641 4.98162 7.70392C4.98162 8.92144 5.87311 10.0986 5.99772 10.2639C6.12233 10.4291 7.75244 12.9282 10.2483 14.0004C10.8418 14.2554 11.3054 14.4078 11.6669 14.5218C12.2628 14.7103 12.8052 14.6838 13.234 14.6201C13.712 14.5489 14.7061 14.0213 14.9133 13.4434C15.1206 12.8655 15.1206 12.3698 15.0585 12.2667C14.9964 12.1637 14.8303 12.1015 14.5815 11.9776L14.5819 11.9766Z" fill="white"></path></g><defs><clipPath id="${clipId}"><rect width="20" height="20" fill="white"></rect></clipPath></defs></svg>`;
}

let cachedTemplate: string | null = null;

function loadReportTemplate(): string {
  if (cachedTemplate) return cachedTemplate;
  const path = new URL("./report.html", import.meta.url);
  cachedTemplate = Deno.readTextFileSync(path);
  return cachedTemplate;
}

export type MenopauseReportPdf = {
  menopauseStage?: { stage?: string; description?: string };
  menoScore?: { score?: number; scorename?: string; description?: string };
  keySymptoms?: {
    mostImpactful?: { dataPointName: string; severity: number }[];
    moderateImpact?: { dataPointName: string; severity: number }[];
  };
};

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
  const memberLink = t["become_member_link"] ?? "https://evrbloom.ro/products/abonament-evrbloom";
  const talkLabel = t["talk_to_doctor"] ?? "Chat with a doctor";
  const symptomMoreLabel = t["symptom_link_text"] ?? "Read more";

  return allSymptoms.map((symptom, index) => {
    const base = getSymptomBaseId(symptom.dataPointName);
    const name = t[`${base}_name`];
    const description = t[`${base}_description`];
    const link = t[`${base}_link`];
    if (!name || !description || !link) return "";
    const clipId = `clip_sym_${index}`;
    return `<div class="symptom high symptom${index}" id="symptom_pdf_${index}">
        <div class="name">
        ${SVG_PULSE}
          ${escapeHtml(name)}
        </div>
        <div class="description">${description}</div>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <a href="${escapeHtml(memberLink)}" target="_blank" rel="noopener noreferrer" class="button whatsapp">
          ${whatsappSvg(clipId)}
            <span>${escapeHtml(talkLabel)}</span>
          </a>
          <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="button button--secondary">
            <span>${escapeHtml(symptomMoreLabel)}</span>
            ${SVG_ARROW}
          </a>
        </div>
      </div>`;
  }).join("\n");
}

export function buildMenopauseReportPdfHtml(report: MenopauseReportPdf, lang: PdfLang): string {
  const stage = report.menopauseStage?.stage ?? "";
  const score = Number(report.menoScore?.score ?? 0);
  const template = loadReportTemplate();
  const symptoms = buildSymptomsSection(report, lang);

  return template
    .replaceAll("{{STAGE}}", escapeHtml(stage))
    .replaceAll("{{STAGE_IMAGE_URL}}", escapeHtml(getStageImageUrl(stage)))
    .replaceAll("{{STAGE_DESCRIPTION}}", convertMarkdownLinksToHtml(report.menopauseStage?.description ?? ""))
    .replaceAll("{{SCORE}}", escapeHtml(String(score)))
    .replaceAll("{{SCORE_PROGRESS}}", scoreProgressOffset(score))
    .replaceAll("{{SCORENAME}}", escapeHtml(report.menoScore?.scorename ?? ""))
    .replaceAll("{{SCORE_DESCRIPTION}}", convertMarkdownLinksToHtml(report.menoScore?.description ?? ""))
    .replaceAll("{{SYMPTOMS_SECTION}}", symptoms);
}
