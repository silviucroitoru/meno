import { useTranslate } from "../../i18n/useTranslate";

export default function QuestionCta({ config }) {
  const { t } = useTranslate();

  return (
    <div className="question-cta-bar">
      <a
        href={t(config.consultationLink)}
        target="_blank"
        rel="noopener noreferrer"
        className="button button--primary"
      >
        {t(config.consultationLabel)}
      </a>
      <a
        href={t(config.phoneLink)}
        className="button button--secondary"
      >
        {t(config.phoneLabel)}
      </a>
    </div>
  );
}
