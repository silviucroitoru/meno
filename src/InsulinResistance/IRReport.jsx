import "../LeadQuestionAnswer/menoscore.css";
import "./ir-report.css";
import ScoreCircle from "../LeadQuestionAnswer/ScoreCircle.jsx";
import { useTranslate } from "../i18n/useTranslate";
import mixpanel from "mixpanel-browser";

const ZONE_COLORS = { green: "#2e7d32", yellow: "#f9a825", red: "#c62828" };

export default function IRReport({ zone, score, normalizedScore }) {
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
        {/* Section 1: Book a call */}
        <div className="box" id="book_call">
          <div className="content">
            <div className="title">{t("ir_benefits_title")}</div>
            <div className="description"
                 dangerouslySetInnerHTML={{ __html: t("ir_benefits_description") }} />
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
                href={t("ir_checkup_link")}
                target="_blank"
                className="button button--secondary"
                onClick={() => trackEvent("IR Checkup Click", "Book a call section")}
              >
                <span>{t("ir_cta_checkup")}</span>
              </a>
              <a
                href={t("ir_phone_link")}
                className="button button--secondary"
                onClick={() => trackEvent("IR Phone Click", "Book a call section")}
              >
                <span>{t("ir_cta_phone")}</span>
              </a>
            </div>
          </div>
          <div className="info-box-dr">
            <img src="/neda_crnjak.jpg" alt="" />
            <div className="dr-info">
              <div className="dr-name">{t("ir_dr_name")}</div>
              <div className="dr-desc" dangerouslySetInnerHTML={{ __html: t("ir_dr_info") }} />
            </div>
          </div>
        </div>

        {/* Section 2: Zone result */}
        <div className="meno-score" id="result">
          <ScoreCircle
            score={normalizedScore}
            size={128}
            strokeWidth={8}
            color={ZONE_COLORS[zone] ?? ZONE_COLORS.yellow}
          />
          <div className="meno-stage-main-content">
            <div className="meno-stage-text">
              <div className="meno-stage-prehead">
                {t("ir_result_prehead")}
              </div>
              <div className="meno-stage-title">
                {t(`ir_zone_${zone}_subtitle`)}: {t(`ir_zone_${zone}_title`)}
              </div>
              <div
                className="meno-stage-description"
                dangerouslySetInnerHTML={{ __html: t(`ir_zone_${zone}_body`) }}
              />
            </div>
          </div>
          <div className="meno-stage-explanation" />
        </div>
      </div>
    </div>
  );
}
