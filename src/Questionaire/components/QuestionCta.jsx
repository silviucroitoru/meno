import { useTranslate } from "../../i18n/useTranslate";

export default function QuestionCta({ config }) {
  const { t } = useTranslate();

  return (
    <div className="question-cta-bar">
      <a
        href={t(config.consultationLink)}
        target="_blank"
        rel="noopener noreferrer"
        className="question-cta-btn question-cta-btn--primary"
      >
        {t(config.consultationLabel)}
      </a>
      <a
        href={t(config.phoneLink)}
        className="question-cta-btn question-cta-btn--outline"
      >
        {t(config.phoneLabel)}
      </a>
    </div>
  );
}
