/**
 * Meta Pixel — lazy-loaded when we fire an event (no automatic PageView on every route).
 * Pixel ID: `VITE_META_PIXEL_ID` or default below.
 */
const DEFAULT_PIXEL_ID = "929643792895832";

function getPixelId() {
  const fromEnv = import.meta.env.VITE_META_PIXEL_ID?.trim();
  return fromEnv || DEFAULT_PIXEL_ID;
}

/**
 * Injects fbevents.js and calls fbq('init', id). Safe to call multiple times.
 * @returns {boolean} true if pixel is ready to receive events
 */
export function initMetaPixel() {
  if (typeof window === "undefined") return false;
  const id = getPixelId();
  if (!id) return false;

  if (window.fbq) {
    return true;
  }

  const f = window;
  const b = document;
  const e = "script";
  const v = "https://connect.facebook.net/en_US/fbevents.js";
  let n;
  let t;
  let s;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  t = b.createElement(e);
  t.async = true;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);

  window.fbq("init", id);
  return true;
}

/** Standard events: PageView, Lead, CompleteRegistration, etc. */
export function metaPixelTrack(eventName, params) {
  if (typeof window === "undefined" || !window.fbq || !eventName) return;
  window.fbq("track", eventName, params ?? {});
}

/** Custom events (show in Events Manager as custom conversions). */
export function metaPixelTrackCustom(eventName, params) {
  if (typeof window === "undefined" || !window.fbq || !eventName) return;
  window.fbq("trackCustom", eventName, params ?? {});
}
