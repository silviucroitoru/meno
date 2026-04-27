import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { IntlProvider } from "react-intl";
import App from "./App.jsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import EnglishMessages from "./locales/en/translations.json";
import RomanianMessages from "./locales/ro/translations.json";
import SerbianMessages from "./locales/sr/translations.json";
import { Tolgee, DevTools, TolgeeProvider, FormatSimple, BackendFetch } from "@tolgee/react";

const messages = {
  en: EnglishMessages,
  ro: RomanianMessages,
  sr: SerbianMessages,
};

const getInitialLanguage = () => {
  // Get the language from the URL (e.g., ?lang=en)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("language")?.toLowerCase();

  // Get the language from localStorage
  let storedLanguage = localStorage.getItem("language")?.toLowerCase();

  // If URL has a valid language, store it in localStorage
  if (urlLang && messages[urlLang]) {
    localStorage.setItem("language", urlLang);
    return urlLang;
  }

  // If no valid URL param, use the stored language or fallback to 'ro'
  return messages[storedLanguage] ? storedLanguage : "sr";
};

const Root = () => {
  const [language, setLanguage] = useState(getInitialLanguage());

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem("language")?.toLowerCase();
      if (newLang && messages[newLang] && newLang !== language) {
        setLanguage(newLang);
      }
    };

    // Listen for changes in localStorage (if language changes elsewhere in the app)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [language]);
  const tolgee = Tolgee()
    .use(BackendFetch({ prefix: 'https://cdn.tolg.ee/de83316f2e94ecb765e9e825d8435a0f' }))
    .use(DevTools())
    .use(FormatSimple())
    .init({
      language: language ?? 'sr',

      apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL,
      apiKey: import.meta.env.VITE_APP_TOLGEE_API_KEY,

      staticData: {}
    });
  return (
    <IntlProvider locale={language} messages={messages[language]}>
      <React.StrictMode>
        <TolgeeProvider
          tolgee={tolgee}
          fallback="Loading..."
        >
          <App />
        </TolgeeProvider>
      </React.StrictMode>
    </IntlProvider>
  );
};

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
