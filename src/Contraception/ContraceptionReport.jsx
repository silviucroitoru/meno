import "../LeadQuestionAnswer/menoscore.css";
import "./contraception-report.css";
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
        <div className="meno-stage" id="recommendations">
          <div className="meno-stage-main-content">
            <div className="meno-stage-text">
              <div className="meno-stage-prehead">
                {t("contraception_sidebar_recommendations")}
              </div>
              <div className="meno-stage-title">
                {t("contraception_report_title")}
              </div>
              <div className="meno-stage-description">
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
          </div>
          <div className="meno-stage-explanation" />
        </div>

        {/* Section 2: Safety + Benefits */}
        <div className="meno-stage" id="safety">
          <div className="meno-stage-main-content">
            <div className="meno-stage-text">
              <div className="meno-stage-prehead">
                {t("contraception_sidebar_safety")}
              </div>
              <div className="meno-stage-title">
                {t("contraception_safety_title")}
              </div>
              <div className="meno-stage-description"
                dangerouslySetInnerHTML={{ __html: t("contraception_safety_body") }}
              />
            </div>
          </div>
          <div className="meno-stage-explanation" />
        </div>

        {/* Section 3: Book a call */}
        <div className="box" id="book_call">
          <div className="content">
            <div className="title">{t("contraception_benefits_title")}</div>
            <div className="description">
              <p>{t("contraception_benefits_intro")}</p>
              <ul>
                <li dangerouslySetInnerHTML={{ __html: t("contraception_benefit_1") }} />
                <li dangerouslySetInnerHTML={{ __html: t("contraception_benefit_2") }} />
                <li dangerouslySetInnerHTML={{ __html: t("contraception_benefit_3") }} />
                <li dangerouslySetInnerHTML={{ __html: t("contraception_benefit_4") }} />
              </ul>
              <p>{t("contraception_benefits_outro")}</p>
            </div>
            <div className="actions">
              <a
                href={t("book_call_dr_link")}
                target="_blank"
                className="button button--primary"
                onClick={() => trackEvent("Contraception Book a call Click", "Book a call section")}
              >
                <span>{t("contraception_cta_consultation")}</span>
              </a>
              <a
                href={t("book_call_checkup_link")}
                target="_blank"
                className="button button--secondary"
                onClick={() => trackEvent("Contraception Checkup Click", "Book a call section")}
              >
                <span>{t("contraception_cta_checkup")}</span>
              </a>
              <a
                href={t("book_call_phone_link")}
                className="button button--secondary"
                onClick={() => trackEvent("Contraception Phone Click", "Book a call section")}
              >
                <span>{t("book_call_phone")}</span>
              </a>
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
