/**
 * Find submissions from June 23-24 that have no report, then
 * re-trigger generate-score for each one.
 *
 * Usage:
 *   node scripts/regenerate-missing-reports.mjs [--dry-run]
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars,
 * or falls back to the hardcoded project URL with the anon key for the query
 * (the edge function itself uses service role internally).
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://mezspuvluagncuepolln.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const API_BASE = `${SUPABASE_URL}/functions/v1`;

if (!SUPABASE_KEY) {
  console.error(
    "Set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) env var."
  );
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FROM = "2026-06-23T00:00:00+03:00";
const TO = "2026-06-25T00:00:00+03:00";

// Find completed submissions in the date range that have no report
const { data: submissions, error } = await supabase
  .from("submissions")
  .select("id, language, created_at, responses")
  .gte("created_at", FROM)
  .lt("created_at", TO)
  .order("id", { ascending: true });

if (error) {
  console.error("Failed to fetch submissions:", error.message);
  process.exit(1);
}

// Check which ones have no report
const { data: reports } = await supabase
  .from("reports")
  .select("submission_id")
  .in(
    "submission_id",
    submissions.map((s) => s.id)
  );

const reportedIds = new Set((reports || []).map((r) => r.submission_id));

const missing = submissions.filter((s) => {
  const responses = s.responses || {};
  const hasEmail = !!responses.Email;
  const hasReport = reportedIds.has(s.id);
  return hasEmail && !hasReport;
});

console.log(
  `Found ${submissions.length} submissions between Jun 23-24, ${missing.length} without reports.\n`
);

if (missing.length === 0) {
  console.log("Nothing to regenerate.");
  process.exit(0);
}

for (const sub of missing) {
  const lang = (sub.language || "SR").toLowerCase();
  const url = `${API_BASE}/generate-score?submissionId=${sub.id}&language=${lang}&regenerate=true`;

  if (dryRun) {
    console.log(`[DRY RUN] Would call: ${url}`);
    continue;
  }

  console.log(`Regenerating submission ${sub.id} (${sub.responses?.Email || "no email"})...`);

  try {
    const res = await fetch(url);
    if (res.ok) {
      console.log(`  ✓ Success (${res.status})`);
    } else {
      const body = await res.text();
      console.error(`  ✗ Failed (${res.status}): ${body.slice(0, 200)}`);
    }
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`);
  }

  // Small delay to avoid rate-limiting
  await new Promise((r) => setTimeout(r, 2000));
}

console.log("\nDone.");
