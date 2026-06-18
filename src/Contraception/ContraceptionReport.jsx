import "../LeadQuestionAnswer/menoscore.css";
import milicaImage from "../assets/milica-petrovic-kmezic.jpg";
import { useTranslate } from "../i18n/useTranslate";
import mixpanel from "mixpanel-browser";

export default function ContraceptionReport({ recommendedMethods }) {
  const { t } = useTranslate();

  const trackEvent = (event, source) => {
    const token = mixpanel.get_config?.("token");
    if (token) mixpanel.track(event, { source });
  };

  return (
    <div className="results">
      <div className="topic-header">
        <a href="/contraception">
          <img src="/primea_logo.png" alt="Primea" className="logo" />
        </a>
      </div>
      <div className="meno-score-container">
        {/* Section 1: Recommendations */}
        <div className="box" id="recommendations">
          <div className="title">{t("contraception_report_title")}</div>
          <div className="description">
            <p>{t("contraception_report_intro")}</p>
            {recommendedMethods.length > 0 ? (
              <ul>
                {recommendedMethods.map((method) => (
                  <li key={method}>{method}</li>
                ))}
              </ul>
            ) : (
              <p><em>Konsultujte lekara za personalizovanu preporuku.</em></p>
            )}
          </div>
        </div>

        {/* Section 2: Safety + Benefits */}
        <div className="box" id="safety">
          <div className="title">{t("contraception_safety_title")}</div>
          <div className="description">
            <div dangerouslySetInnerHTML={{ __html: t("contraception_safety_body") }} />
            <h3 className="title" style={{ marginTop: 32, maxWidth: "100%" }}>
              {t("contraception_benefits_title")}
            </h3>
            <p>{t("contraception_benefits_intro")}</p>
            <ul>
              <li>{t("contraception_benefit_1")}</li>
              <li>{t("contraception_benefit_2")}</li>
              <li>{t("contraception_benefit_3")}</li>
              <li>{t("contraception_benefit_4")}</li>
            </ul>
            <p>{t("contraception_benefits_outro")}</p>
          </div>
        </div>

        {/* Section 3: Book a call */}
        <div className="box" id="book_call">
          <div className="content">
            <div className="title" dangerouslySetInnerHTML={{ __html: t("book_call_content_title") }} />
            <div className="description" dangerouslySetInnerHTML={{ __html: t("book_call_content_description") }} />
            <div className="actions">
              <a
                href={t("book_call_dr_link")}
                target="_blank"
                className="button button--primary"
                onClick={() => trackEvent("Contraception Book a call Click", "Book a call section")}
              >
                <span>{t("book_call")}</span>
              </a>
              <a
                href={t("book_call_checkup_link")}
                target="_blank"
                className="button button--secondary"
                onClick={() => trackEvent("Contraception Checkup Click", "Book a call section")}
              >
                <span>{t("book_call_checkup")}</span>
              </a>
              <a
                href={t("book_call_phone_link")}
                className="button button--secondary"
                onClick={() => trackEvent("Contraception Phone Click", "Book a call section")}
              >
                <span>{t("book_call_phone")}</span>
              </a>
            </div>
            <div className="book-call-footnotes">
              <p>*{t("contraception_book_call_footnote_1")}</p>
              <p>*{t("contraception_book_call_footnote_2")}</p>
            </div>
          </div>
          <div className="info-box-dr">
            <img src={milicaImage} alt="" />
            <div className="dr-info">
              <div className="dr-name">{t("book_call_dr_name")}</div>
              <div className="dr-desc" dangerouslySetInnerHTML={{ __html: t("book_call_dr_info") }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
