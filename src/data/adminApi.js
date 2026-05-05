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
    submissionCount: 0,
    reportCount: 0,
    pdfCount: 0,
    byStage: {},
  };
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

