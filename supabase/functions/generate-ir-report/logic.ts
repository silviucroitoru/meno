type Responses = Record<string, unknown>;

export type IRZone = "green" | "yellow" | "red";

export interface IRResult {
  score: number;
  zone: IRZone;
  forcedRed: boolean;
}

const SCORING_FIELDS: readonly string[] = [
  "Women Waist",
  "Men Waist",
  "PCOS",
  "Abdominal Fat",
  "Body Weight",
  "Hungry Level",
  "Cravings",
  "After Eating",
  "Hungry Symptoms",
  "Activity",
  "High Blood Pressure",
  "Triglycerides",
  "HDL Cholesterol",
  "Skin",
  "Type 2 Diabetes",
  "Blood Glucose Level",
  "Homa",
];

function pointsForField(name: string, raw: unknown): number {
  if (raw === undefined || raw === null) return 0;
  let v = parseInt(String(raw), 10);
  if (isNaN(v)) return 0;

  if (name === "Blood Glucose Level" && v === 4) v = 1;
  if (name === "Homa" && v === 4) v = 2;

  if (v >= 1 && v <= 3) return v - 1;
  return 0;
}

function classifyZone(score: number): IRZone {
  if (score <= 10) return "green";
  if (score <= 18) return "yellow";
  return "red";
}

export function computeIRResult(responses: Responses): IRResult {
  let score = 0;
  for (const field of SCORING_FIELDS) {
    score += pointsForField(field, responses[field]);
  }

  const glucoseRaw = String(responses["Blood Glucose Level"] ?? "");
  const homaRaw = String(responses["Homa"] ?? "");
  const forcedRed = glucoseRaw === "3" || homaRaw === "3";

  const zone: IRZone = forcedRed ? "red" : classifyZone(score);

  return { score, zone, forcedRed };
}
