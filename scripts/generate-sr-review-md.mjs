import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dest = path.join(root, "docs/sr-frontend-translations-review.md");

// ── Part 1: translations.json ─────────────────────────────────────────────────
const t = JSON.parse(fs.readFileSync(path.join(root, "src/locales/sr/translations.json"), "utf8"));

const lines = [
  "# Serbian translations — review list",
  "",
  "## UI strings (translations.json)",
  "",
];

for (const [key, val] of Object.entries(t)) {
  const v = String(val).trim();
  if (v.startsWith("http")) continue;
  lines.push(`**${key}**`);
  lines.push(v.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim());
  lines.push("");
}

// ── Part 2: questionnaire ─────────────────────────────────────────────────────
const q = JSON.parse(
  fs.readFileSync(path.join(root, "src/locales/sr/questionnaire.json"), "utf8"),
);

lines.push("---");
lines.push("");
lines.push("## Questionnaire (from DB)");
lines.push("");

for (const step of q.info) {
  const s = step.settings;
  const id = `[position ${step.position}] ${step.DataPointName}`;

  if (s.RichText) {
    lines.push(`**${id} — RichText**`);
    lines.push(s.RichText.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim());
    lines.push("");
  }
  if (s.QuestionText) {
    lines.push(`**${id} — QuestionText**`);
    lines.push(s.QuestionText);
    lines.push("");
  }
  if (s.QuestionHelper) {
    lines.push(`**${id} — QuestionHelper**`);
    lines.push(s.QuestionHelper);
    lines.push("");
  }
  if (s.fields) {
    for (const f of s.fields) {
      if (f.label) {
        lines.push(`**${id} — field label**`);
        lines.push(f.label);
        lines.push("");
      }
      if (f.error_message) {
        lines.push(`**${id} — field error**`);
        lines.push(f.error_message);
        lines.push("");
      }
    }
  }
  if (s.options) {
    s.options.forEach((o, i) => {
      lines.push(`**${id} — option ${i + 1}**`);
      lines.push(o.OptionText);
      lines.push("");
    });
  }
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, lines.join("\n"), "utf8");
console.log("Done →", dest);
