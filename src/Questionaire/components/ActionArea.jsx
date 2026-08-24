import {FormattedMessage} from "react-intl";

export default function ActionArea({currentPage, next, back, dataPointId, dataPointName, a, isAvailable, type, checkbox, checked, onCheckedChange, checkbox2, checked2, onCheckedChange2}) {
  const hasCheckbox = type === 'intro' && !!checkbox;
  const hasCheckbox2 = type === 'intro' && !!checkbox2;
  const introClass = type === 'intro' ? 'intro' : '';
  const disclaimerClass = hasCheckbox ? 'width-disclaimer' : '';
  const justifyClass = (currentPage.position === 1 && !hasCheckbox) ? 'justify-end' : 'justify-between';

  return (
    <div className={`action-area ${introClass} ${disclaimerClass} ${justifyClass}`.replace(/\s+/g, ' ').trim()}>
      {hasCheckbox && (
        <div className="disclaimer">
          <label className="intro-checkbox">
            <input type="checkbox" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} className="intro-checkbox__input" />
            <span className="intro-checkbox__icon" aria-hidden="true">
              {checked ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="20" height="20" rx="2" fill="currentColor"/>
                  <path d="M14.6668 6.5L8.25016 12.9167L5.3335 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.5" y="0.5" width="19" height="19" rx="1.5" stroke="currentColor"/>
                </svg>
              )}
            </span>
            <span>{checkbox}</span>
          </label>
          {hasCheckbox2 && (
            <label className="intro-checkbox" style={{marginTop: '12px'}}>
              <input type="checkbox" checked={checked2} onChange={(e) => onCheckedChange2(e.target.checked)} className="intro-checkbox__input" />
              <span className="intro-checkbox__icon" aria-hidden="true">
                {checked2 ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="20" height="20" rx="2" fill="currentColor"/>
                    <path d="M14.6668 6.5L8.25016 12.9167L5.3335 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="19" height="19" rx="1.5" stroke="currentColor"/>
                  </svg>
                )}
              </span>
              <span>{checkbox2}</span>
            </label>
          )}
        </div>
      )}
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