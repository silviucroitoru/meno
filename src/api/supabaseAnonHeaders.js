/** Headers required by Supabase Edge Functions gateway (use anon key, not service role). */
export function supabaseAnonKey() {
  return (
    import.meta.env.VITE_API_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    ""
  ).trim();
}

export function supabaseAnonHeaders() {
  const key = supabaseAnonKey();
  if (!key) {
    if (import.meta.env.DEV) {
      console.warn(
        "Missing VITE_API_KEY or VITE_SUPABASE_ANON_KEY — Edge Function calls will return 401.",
      );
    }
    return {};
  }
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
  };
}
