import "../components/styles/sidebar.css";
import { useTranslate } from "../i18n/useTranslate";

export default function ContraceptionSideBar() {
  const { t } = useTranslate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 32;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/primea_logo.png" alt="Primea" />
      </div>
      <div className="dashboardMenu">
        <button className="menuLink" onClick={() => scrollTo("recommendations")}>
          {t("contraception_sidebar_recommendations")}
        </button>
        <button className="menuLink" onClick={() => scrollTo("safety")}>
          {t("contraception_sidebar_safety")}
        </button>
        <button className="menuLink" onClick={() => scrollTo("book_call")}>
          {t("contraception_sidebar_book_call")}
        </button>
      </div>
    </div>
  );
}
