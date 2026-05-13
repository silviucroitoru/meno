/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_META_PIXEL_ID?: string;
}

interface Window {
  fbq?: (...args: unknown[]) => void;
  _fbq?: unknown;
}
