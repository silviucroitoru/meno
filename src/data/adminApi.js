import { supabase, isSupabaseConfigured } from "./supabaseClient";

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured for this build (missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).",
    );
  }
}

export async function adminSignIn(email, password) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email ?? "").trim(),
    password: String(password ?? ""),
  });
  if (error) {
    throw new Error(error.message || "Could not sign in");
  }
  return data;
}

export async function adminSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    // eslint-disable-next-line no-console
    console.warn("[Admin] Sign out error", error);
  }
}

export async function getAdminSession() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    // eslint-disable-next-line no-console
    console.warn("[Admin] getSession error", error);
    return null;
  }
  return data?.session ?? null;
}

export function onAdminAuthChange(callback) {
  assertSupabaseConfigured();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session ?? null);
  });
  return () => {
    data?.subscription?.unsubscribe?.();
  };
}

export async function fetchAdminMetrics() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc("admin_metrics");
  if (error) {
    throw new Error(error.message || "Failed to load metrics");
  }
  return data ?? {
    successfulSubmissions: 0,
    totalSubmissions: 0,
    withoutReportCount: 0,
    completionRatePct: 0,
    byStage: {},
    byEmailStatus: {},
  };
}

export async function fetchAdminMarketingAccess() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc("admin_marketing_access");
  if (error) return { allowed: false };
  return data ?? { allowed: false };
}

export async function fetchAdminMarketingRange({ from, to }) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc("admin_marketing_range", {
    p_from: from,
    p_to: to,
  });
  if (error) throw new Error(error.message || "Failed to load marketing data");
  return data ?? { total_spend_usd: 0, total_submissions: 0, avg_cpa_usd: null, rows: [] };
}

export async function setAdminMarketingDay(day, amountUsd) {
  assertSupabaseConfigured();
  const { error } = await supabase.rpc("admin_marketing_set_day", {
    p_day: day,
    p_amount_usd: amountUsd,
  });
  if (error) throw new Error(error.message || "Failed to save spend");
}

export async function fetchAdminDailySubmissions({ from, to }) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc("admin_daily_submissions", {
    p_from: from,
    p_to: to,
  });
  if (error) throw new Error(error.message || "Failed to load daily data");
  return data ?? [];
}

export async function fetchAdminSubmissions({ search = "", limit = 50, offset = 0 } = {}) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc("admin_list_submissions", {
    p_search: search || null,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) {
    throw new Error(error.message || "Failed to load submissions");
  }
  return data ?? { total: 0, limit, offset, rows: [] };
}

