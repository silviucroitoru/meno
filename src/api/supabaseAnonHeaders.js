/** Headers required by Supabase Edge Functions gateway (use anon key, not service role). */
export function supabaseAnonHeaders() {
  const key = import.meta.env.VITE_API_KEY;
  if (!key) return {};
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
  };
}
