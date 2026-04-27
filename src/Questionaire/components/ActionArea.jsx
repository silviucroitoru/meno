import {FormattedMessage} from "react-intl";
import { useTranslate, T } from "@tolgee/react";

export default function ActionArea({currentPage, next, back, dataPointId, dataPointName, a, isAvailable, type, language}) {
  const { t } = useTranslate();
  const privacyLinkFunction = (content) => <a href="https://evrbloom.ro/policies/privacy-policy" target="_blank" rel="noopener noreferrer">{content}</a>;
  return (
    <div
      className={`action-area ${type === 'intro' ? 'width-disclaimer' : ''} ${currentPage.position === 1 ? 'justify-end' : 'justify-between'}`}>
      {
        type === 'intro' && (
          <div className="disclaimer">
            {/*<T keyName="terms_agreement" components={{privacyLink: privacyLinkFunction}} />*/}
            <FormattedMessage
              id="terms_agreement"
              values={{
                privacyPolicy: (
                  <a href="https://evrbloom.ro/policies/privacy-policy" target="_blank">
                    <FormattedMessage id="privacy_policy" />
                  </a>
                ),
              }}
            />
          </div>
        )
      }
      {
        currentPage.position !== 1 && (
          <button className="button button--secondary" onClick={() => {
            back()
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.8327 10.0001H4.16602M4.16602 10.0001L9.99935 15.8334M4.16602 10.0001L9.99935 4.16675"
                    stroke="#3D497A" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/*<span>{t('back')}</span>*/}
            <FormattedMessage id="back" />
          </button>
        )
      }
      {
        (currentPage.QuestionType !== 'single_option' && currentPage.QuestionType !== 'single_option_image' && currentPage.QuestionType !== 'scale') && (
          <button
            className="button button--primary"
            disabled={!isAvailable}
            onClick={() => next(currentPage.jump ? currentPage.jump : currentPage.position + 1, dataPointId, dataPointName, a, type)}
          >
            {/*<span>{t('continue')}</span>*/}
            <FormattedMessage id="continue" />
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4.66602 9.99996H16.3327M16.3327 9.99996L10.4993 4.16663M16.3327 9.99996L10.4993 15.8333"
                stroke="white"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )
      }

    </div>
  )
}