import { createClient } from "@supabase/supabase-js";

/** Trim and strip accidental wrapping quotes from .env / Vercel paste */
function stripQuotes(s) {
  let t = String(s ?? "").trim();
  if ((t.startsWith("\"") && t.endsWith("\"")) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

/**
 * Normalize VITE_SUPABASE_URL: full https URL, or host-only `xxxx.supabase.co`
 */
function normalizeSupabaseUrl(raw) {
  const s0 = stripQuotes(raw).replace(/\s+/g, "");
  if (!s0) return "";
  if (/^https?:\/\//i.test(s0)) return s0.replace(/\/$/, "");
  const hostOnly = s0.replace(/^\/+/, "").replace(/\/+$/, "");
  if (/^[a-z0-9-]+\.supabase\.co$/i.test(hostOnly)) return `https://${hostOnly}`;
  return stripQuotes(raw).trim();
}

function normalizeAnonKey(raw) {
  return stripQuotes(raw);
}

function isUsableSupabaseUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const resolvedUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const resolvedKey = normalizeAnonKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(resolvedKey && isUsableSupabaseUrl(resolvedUrl));

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing/invalid. " +
      "Admin auth will not work until configured.",
  );
}

const placeholderUrl = "https://invalid-project-ref.supabase.co";
const placeholderKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.placeholder-anon-key";

export const supabase = createClient(
  isSupabaseConfigured ? resolvedUrl : placeholderUrl,
  isSupabaseConfigured ? resolvedKey : placeholderKey,
);

