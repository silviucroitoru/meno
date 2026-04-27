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
  return (
    <IntlProvider locale={language} messages={messages[language]}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </IntlProvider>
  );
};

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
