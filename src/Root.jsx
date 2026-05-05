import React, { useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import App from "./App.jsx";
import EnglishMessages from "./locales/en/translations.json";
import RomanianMessages from "./locales/ro/translations.json";
import SerbianMessages from "./locales/sr/translations.json";

const messages = {
  en: EnglishMessages,
  ro: RomanianMessages,
  sr: SerbianMessages,
};

const getInitialLanguage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("language")?.toLowerCase();

  if (urlLang && messages[urlLang]) {
    localStorage.setItem("language", urlLang);
    return urlLang;
  }

  localStorage.setItem("language", "sr");
  return "sr";
};

export default function Root() {
  const [language, setLanguage] = useState(getInitialLanguage());

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem("language")?.toLowerCase();
      if (newLang && messages[newLang] && newLang !== language) {
        setLanguage(newLang);
      }
    };

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
}

