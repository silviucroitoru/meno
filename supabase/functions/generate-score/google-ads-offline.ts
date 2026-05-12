import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const API_VERSION = Deno.env.get("GOOGLE_ADS_API_VERSION")?.trim() || "v18";

function stripCustomerId(id: string): string {
  return id.replace(/-/g, "").replace(/\s/g, "").trim();
}

function formatConversionDateTimeUtc(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}+00:00`;
}

async function getGoogleAdsAccessToken(): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLE_ADS_CLIENT_ID")?.trim();
  const clientSecret = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET")?.trim();
  const refreshToken = Deno.env.get("GOOGLE_ADS_REFRESH_TOKEN")?.trim();
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("Google Ads OAuth token error:", res.status, t);
    return null;
  }
  const json = await res.json();
  return typeof json?.access_token === "string" ? json.access_token : null;
}

function resolveConversionActionResource(customerIdNorm: string, raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith("customers/")) return t;
  if (/^\d+$/.test(t)) return `customers/${customerIdNorm}/conversionActions/${t}`;
  return null;
}

function uploadSucceeded(json: Record<string, unknown>): boolean {
  if (json.partialFailureError) return false;
  const results = json.results as Array<Record<string, unknown>> | undefined;
  if (!results?.length) return false;
  for (const r of results) {
    if (r.error) return false;
  }
  return true;
}

const MAX_CLICK_ID_LEN = 500;

function trimClickId(v: string | null | undefined): string {
  const s = (v ?? "").trim();
  return s.length > MAX_CLICK_ID_LEN ? s.slice(0, MAX_CLICK_ID_LEN) : s;
}

async function uploadClickConversion(
  submissionId: number,
  gclid: string,
  wbraid: string,
  gbraid: string,
): Promise<boolean> {
  const customerIdRaw = Deno.env.get("GOOGLE_ADS_CUSTOMER_ID")?.trim();
  const conversionActionRaw = Deno.env.get("GOOGLE_ADS_CONVERSION_ACTION")?.trim();
  const developerToken = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN")?.trim();

  if (!customerIdRaw || !conversionActionRaw || !developerToken) {
    console.warn(
      "Google Ads offline conversion: set GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_CONVERSION_ACTION, GOOGLE_ADS_DEVELOPER_TOKEN to enable uploads",
    );
    return false;
  }

  const customerId = stripCustomerId(customerIdRaw);
  const conversionAction = resolveConversionActionResource(customerId, conversionActionRaw);
  if (!conversionAction) {
    console.error("Google Ads: invalid GOOGLE_ADS_CONVERSION_ACTION (expected full resource or numeric id)");
    return false;
  }

  const accessToken = await getGoogleAdsAccessToken();
  if (!accessToken) {
    console.warn(
      "Google Ads offline conversion: OAuth failed; check GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN",
    );
    return false;
  }

  const conv: Record<string, string | number> = {
    conversionAction,
    conversionDateTime: formatConversionDateTimeUtc(new Date()),
    currencyCode: Deno.env.get("GOOGLE_ADS_CONVERSION_CURRENCY")?.trim() || "EUR",
    conversionValue: Number(Deno.env.get("GOOGLE_ADS_CONVERSION_VALUE") ?? "0") || 0,
    orderId: `menoscore-submission-${submissionId}`,
  };
  if (gclid) conv.gclid = gclid;
  else if (gbraid) conv.gbraid = gbraid;
  else conv.wbraid = wbraid;

  const url = `https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}:uploadClickConversions`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": developerToken,
    "Content-Type": "application/json",
  };
  const loginCustomerId = Deno.env.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID")?.trim();
  if (loginCustomerId) headers["login-customer-id"] = stripCustomerId(loginCustomerId);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      partialFailure: true,
      conversions: [conv],
    }),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    console.error("Google Ads upload: non-JSON response", res.status, text.slice(0, 500));
    return false;
  }

  if (!res.ok) {
    console.error("Google Ads uploadClickConversions HTTP error:", res.status, text.slice(0, 2000));
    return false;
  }

  if (!uploadSucceeded(json)) {
    console.error("Google Ads uploadClickConversions failed:", JSON.stringify(json).slice(0, 3000));
    return false;
  }

  return true;
}

/**
 * Reads latest click IDs from DB, uploads offline conversion once when a report exists.
 * Safe to call on cache hits (retries after a failed upload).
 */
export async function uploadDashboardConversionForSubmission(
  supabase: SupabaseClient,
  submissionId: number,
): Promise<void> {
  const { data: row, error } = await supabase
    .from("submissions")
    .select("gclid, wbraid, gbraid, google_ads_conversion_uploaded_at")
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !row) return;
  if (row.google_ads_conversion_uploaded_at) return;

  const gclid = trimClickId(row.gclid as string | null);
  const wbraid = trimClickId(row.wbraid as string | null);
  const gbraid = trimClickId(row.gbraid as string | null);
  if (!gclid && !wbraid && !gbraid) return;

  const ok = await uploadClickConversion(submissionId, gclid, wbraid, gbraid);
  if (!ok) return;

  const { error: upErr } = await supabase
    .from("submissions")
    .update({ google_ads_conversion_uploaded_at: new Date().toISOString() })
    .eq("id", submissionId);
  if (upErr) console.error("Failed to persist google_ads_conversion_uploaded_at:", upErr);
}
