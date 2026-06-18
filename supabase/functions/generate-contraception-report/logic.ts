export const CONTRACEPTION_METHODS = [
  "Kondomi",
  "Kombinovane kontraceptivne pilule",
  "Progestinske (mini) pilule",
  "Vaginalni prsten",
  "Hormonska spirala (IUD)",
  "Bakarna spirala (nehormonska)",
  "Metode praćenja plodnosti (fertility awareness)",
] as const;

/**
 * Map DataPointName → option text for each relevant answer (SR questionnaire).
 * Letters correspond to option order: A = first, B = second, etc.
 */
const OPTION_TEXTS = {
  "Breastfeeding Status": {
    A: "Da, isključivo dojim",
  },
  "Self Description": {
    A: "Želim nehormonsku kontracepciju",
  },
  "Hormonal Contraception Openness": {
    D: "Ne želim hormonsku kontracepciju",
  },
  "Daily Routine Discipline": {
    D: "Često zaboravljam",
  },
  "Smoking Status": {
    A: "Da, redovno pušim",
  },
  "Thrombosis Family History": {
    A: "Da, ja sam imala",
  },
  "Medical History": {
    A: "Krvni ugrušci, moždani udar, infarkt ili migrenu sa aurom",
    B: "Rak dojke, rak endometrijuma ili BRCA mutaciju",
    C: "Visok krvni pritisak, bolest jetre ili cirozu",
  },
  "Contraception Priority": {
    A: "Maksimalna efikasnost",
  },
  "Conception Timeline": {
    D: "Ne planiram trudnoću u skorije vreme",
  },
} as const;

type Responses = Record<string, unknown>;

function responseEquals(responses: Responses, dpn: string, optionText: string): boolean {
  const val = responses[dpn];
  if (typeof val === "string") return val === optionText;
  return false;
}

function responseContains(responses: Responses, dpn: string, optionText: string): boolean {
  const val = responses[dpn];
  if (typeof val === "string") return val === optionText;
  if (Array.isArray(val)) return val.includes(optionText);
  return false;
}

function getAge(responses: Responses): number | null {
  const raw = responses["BirthYear"];
  if (!raw) return null;
  const year = parseInt(String(raw), 10);
  if (isNaN(year) || year < 1900 || year > 2020) return null;
  return new Date().getFullYear() - year;
}

export function getRecommendedMethods(responses: Responses): string[] {
  const excluded = new Set<string>();

  // --- Kombinovane pilule + Vaginalni prsten ---
  const excludeCombined =
    responseEquals(responses, "Breastfeeding Status", OPTION_TEXTS["Breastfeeding Status"].A) ||
    (responseEquals(responses, "Smoking Status", OPTION_TEXTS["Smoking Status"].A) &&
      (getAge(responses) ?? 0) > 35) ||
    responseEquals(responses, "Thrombosis Family History", OPTION_TEXTS["Thrombosis Family History"].A) ||
    responseContains(responses, "Medical History", OPTION_TEXTS["Medical History"].A) ||
    responseContains(responses, "Medical History", OPTION_TEXTS["Medical History"].B) ||
    responseContains(responses, "Medical History", OPTION_TEXTS["Medical History"].C);

  if (excludeCombined) {
    excluded.add("Kombinovane kontraceptivne pilule");
    excluded.add("Vaginalni prsten");
  }

  // --- Hormonska spirala ---
  if (
    responseEquals(responses, "Self Description", OPTION_TEXTS["Self Description"].A) ||
    responseEquals(responses, "Hormonal Contraception Openness", OPTION_TEXTS["Hormonal Contraception Openness"].D)
  ) {
    excluded.add("Hormonska spirala (IUD)");
  }

  // --- Mini pilule ---
  if (responseEquals(responses, "Daily Routine Discipline", OPTION_TEXTS["Daily Routine Discipline"].D)) {
    excluded.add("Progestinske (mini) pilule");
  }

  // --- Metode praćenja plodnosti ---
  if (
    responseEquals(responses, "Contraception Priority", OPTION_TEXTS["Contraception Priority"].A) ||
    responseEquals(responses, "Conception Timeline", OPTION_TEXTS["Conception Timeline"].D)
  ) {
    excluded.add("Metode praćenja plodnosti (fertility awareness)");
  }

  return CONTRACEPTION_METHODS.filter((m) => !excluded.has(m));
}
