import "../LeadQuestionAnswer/menoscore.css";
import "./ir-report.css";
import milicaImage from "../assets/milica-petrovic-kmezic.jpg";
import { useTranslate } from "../i18n/useTranslate";
import mixpanel from "mixpanel-browser";

export default function IRReport({ recommendations }) {
  const { t } = useTranslate();

  const trackEvent = (event, source) => {
    const token = mixpanel.get_config?.("token");
    if (token) mixpanel.track(event, { source });
  };

  return (
    <div className="results">
      <div className="topic-header">
        <a href="/ir">
          <img src="/primea_logo.png" alt="Primea" className="logo" />
        </a>
      </div>
      <div className="meno-score-container">
        {/* Section 1: Recommendations */}
        <div className="meno-stage" id="recommendations">
          <div className="meno-stage-main-content">
            <div className="meno-stage-text">
              <div className="meno-stage-prehead">
                {t("ir_sidebar_recommendations")}
              </div>
              <div className="meno-stage-title">
                {t("ir_report_title")}
              </div>
              <div className="meno-stage-description">
                <p>{t("ir_report_intro")}</p>
                {recommendations.length > 0 ? (
                  <ul>
                    {recommendations.map((item) => (
                      <li key={item}>{item}</li>
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

        {/* Section 2: Book a call */}
        <div className="box" id="book_call">
          <div className="content">
            <div className="title">{t("ir_benefits_title")}</div>
            <div className="description">
              <p>{t("ir_benefits_intro")}</p>
              <ul>
                <li dangerouslySetInnerHTML={{ __html: t("ir_benefit_1") }} />
                <li dangerouslySetInnerHTML={{ __html: t("ir_benefit_2") }} />
                <li dangerouslySetInnerHTML={{ __html: t("ir_benefit_3") }} />
                <li dangerouslySetInnerHTML={{ __html: t("ir_benefit_4") }} />
              </ul>
              <p>{t("ir_benefits_outro")}</p>
            </div>
            <div className="actions">
              <a
                href={t("ir_consultation_link")}
                target="_blank"
                className="button button--primary"
                onClick={() => trackEvent("IR Book a call Click", "Book a call section")}
              >
                <span>{t("ir_cta_consultation")}</span>
              </a>
              <a
                href={t("book_call_checkup_link")}
                target="_blank"
                className="button button--secondary"
                onClick={() => trackEvent("IR Checkup Click", "Book a call section")}
              >
                <span>{t("ir_cta_checkup")}</span>
              </a>
              <a
                href={t("book_call_phone_link")}
                className="button button--secondary"
                onClick={() => trackEvent("IR Phone Click", "Book a call section")}
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

        {/* Section 3: Safety */}
        <div className="meno-stage" id="safety">
          <div className="meno-stage-main-content">
            <div className="meno-stage-text">
              <div className="meno-stage-prehead">
                {t("ir_sidebar_safety")}
              </div>
              <div className="meno-stage-title">
                {t("ir_safety_title")}
              </div>
              <div className="meno-stage-description"
                dangerouslySetInnerHTML={{ __html: t("ir_safety_body") }}
              />
            </div>
          </div>
          <div className="meno-stage-explanation" />
        </div>
      </div>
    </div>
  );
}
