import { useState, useEffect } from "react";
import ScoreCircle from "./ScoreCircle.jsx";
import "./menoscore.css";
import 'swiper/css';
import { FormattedMessage, createIntl } from "react-intl";
import virginiaImage from '../assets/virginia-lazar.png';
import EnglishMessages from "../locales/en/translations.json"
import RomanianMessages from "../locales/ro/translations.json";
import mixpanel from "mixpanel-browser";
import { useTranslate } from "@tolgee/react";

const messages = {
  en: EnglishMessages,
  ro: RomanianMessages,
};

export default function Menoscore({scoreJson, scoreSummary}) {
  const { t } = useTranslate();
  const [arrowPosition, setArrowPosition] = useState(0);
  const [index, setIndex] = useState(-1);
  const [currentTab, setCurrentTab] = useState("high");
  const [lineWidth, setLineWidth] = useState(0);
  const [premenopauseWidth, setPremenopauseWidth] = useState(0);
  const [perimenopauseWidth, setPerimenopauseWidth] = useState(0);
  const [menopauseWidth, setMenopauseWidth] = useState(0);
  const [postmenopauseWidth, setPostmenopauseWidth] = useState(0);
  const language = localStorage.getItem('language').toLowerCase();
  function getTranslatedMessage(id, values = {}) {
    const intl = createIntl(
      {
        locale: language,
        messages: messages[language],
      },
    );
    return intl.formatMessage({ id }, values);
  }
  const stages = [getTranslatedMessage("premenopause", {}), getTranslatedMessage("perimenopause", {}),  getTranslatedMessage("menopause", {}), getTranslatedMessage("postmenopause", {})];
  useEffect(() => {
    mixpanel.track('[Page View] Dashboard', {source: 'Dashboard'})
    setPremenopauseWidth(-6 + document.getElementById('premenopause').offsetWidth / 2);
    setPerimenopauseWidth(-6 + document.getElementById('perimenopause').offsetWidth / 2);
    setMenopauseWidth(-6 + document.getElementById('menopause').offsetWidth / 2);
    setPostmenopauseWidth(-6 + document.getElementById('postmenopause').offsetWidth / 2);
  }, [])
  useEffect(() => {
    setTimeout(() => {
      const indexOfStage =   stages.indexOf(scoreJson.menopauseStage.stage);
      setIndex(indexOfStage);
      setArrowPosition(64 + indexOfStage * lineWidth + 20*indexOfStage)
    }, 500)
  }, [lineWidth])
  const trackEvent = (event, source) => {
    mixpanel.track(event, {source: source})
  }
  const adjustMargin = () => {
    const bookCallSection = document.getElementById("book_call");
    const scaleContainer = document.getElementById("scale_container");
    const scaleContainerWidth = scaleContainer.offsetWidth;
    setLineWidth((scaleContainerWidth - 200) / 3)
    setArrowPosition(64 + index * ((scaleContainerWidth - 200) / 3) + 20*index)
    if (bookCallSection) {
      const windowHeight = window.innerHeight;
      const sectionHeight = bookCallSection.offsetHeight;
      const marginBottom = windowHeight - sectionHeight - 64;
      bookCallSection.style.marginBottom = `${marginBottom}px`;
    }
  };
  useEffect(() => {
    adjustMargin();
    window.addEventListener("resize", adjustMargin);
    return () => window.removeEventListener("resize", adjustMargin);
  }, []);
  const rawDescriptionStage = scoreJson.menopauseStage.description;
  const rawDescriptionScore = scoreJson.menoScore.description;
  const htmlDescriptionStage = rawDescriptionStage.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  const htmlDescriptionScore = rawDescriptionScore.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  let stageMoreLink;
  if(index === 1){
    stageMoreLink = getTranslatedMessage('perimenopause_link', {})
  } else if(index === 2){
    stageMoreLink = getTranslatedMessage('menopause_link', {})
  } else if(index === 3){
    stageMoreLink = getTranslatedMessage('postmenopause_link', {})
  }

  return (
    <div className="results">
      <div className="topic-header">
        <a href="https://score.evrbloom.ro/dashboard">
          <img src="https://evrbloom.ro/cdn/shop/files/evrbloom_logo.svg?v=1742998418&width=100" alt="EvrBloom"
               className="logo"/>
        </a>
      </div>
      <div className="meno-score-container">
        {
          index > -1 && (
            <div className="meno-stage-scale-mobile">
              <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" width="32" height="32" rx="16" fill="#D8DBE4"/>
                <circle cx="16.5" cy="16" r="8" fill="white"/>
              </svg>
              <div className="bubble">
                {stages[index]}
              </div>

            </div>
          )
        }
        <div className="meno-stage-scale">
          <div className="meno-stage-scale-container" id="scale_container">
            <div className={`arrow ${index === -1 ? 'd-none' : ''}`}
                 style={{left: arrowPosition, transitionDuration: `${(index + 1) * 500 + 250}ms`}}>
              <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.5 3.13364C7.16667 3.51854 7.16667 4.48079 6.5 4.86569L1.5 7.75244C0.833332 8.13734 9.86826e-08 7.65621 8.95028e-08 6.88641L2.06545e-08 1.11291C1.14747e-08 0.343109 0.833333 -0.138015 1.5 0.246885L6.5 3.13364Z"
                  fill="#3D497A"/>
              </svg>
            </div>
            <div className="line-small">
              <span className={index >= 0 ? 'active' : ''}></span>
            </div>
            <div className={`item item1 ${index >= 0 ? 'active' : ''}`} style={{left: '64px', textIndent: -(premenopauseWidth)}}>
              <span id="premenopause">{t('premenopause')}</span>
            </div>
            <div className="line-big" style={{left: '20px', width: `${lineWidth}px`}}>
              <span className={index > 0 ? 'active' : ''} style={{transitionDelay: "250ms"}}></span>
            </div>
            <div className={`item item2 ${index > 0 ? 'active' : ''}`}  style={{left: `${lineWidth + 84}px`, textIndent: -(perimenopauseWidth)}}>
              <span id="perimenopause">{t('perimenopause')}</span>
            </div>
            <div className="line-big" style={{left: `40px`, width: `${lineWidth}px`}}>
              <span className={index > 1 ? 'active' : ''} style={{transitionDelay: "750ms"}}></span>
            </div>
            <div className={`item item3 ${index > 1 ? 'active' : ''}`}  style={{left: `${lineWidth*2 + 104}px`, textIndent: -(menopauseWidth)}}>
              <span id="menopause">{t('menopause')}</span>
            </div>
            <div className="line-big" style={{left: `60px`, width: `${lineWidth}px`}}>
              <span className={index > 2 ? 'active' : ''} style={{transitionDelay: "1250ms"}}></span>
            </div>
            <div className={`item item4 ${index > 2 ? 'active' : ''}`}  style={{left: `${lineWidth*3 + 124}px`, textIndent: -(postmenopauseWidth)}}>
              <span id="postmenopause">{t('postmenopause')}</span>
            </div>
            <div className="top-arrow">
              <svg width="60" height="12" viewBox="0 0 60 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="60" y="4" width="4" height="60" rx="2" transform="rotate(90 60 4)" fill="#D8DBE4"/>
                <path fillRule="evenodd" clipRule="evenodd"
                      d="M60 6C60 6.62915 59.7782 7.22768 59.3915 7.64198L55.8277 11.4601C55.0871 12.2536 53.9613 12.1617 53.3133 11.2549C52.6668 10.3502 52.7399 8.97617 53.4757 8.18181L37.7819 8.18181C36.7978 8.18181 36 7.20498 36 6C36 4.79502 36.7978 3.81819 37.7819 3.81819L53.4757 3.81819C52.7399 3.02383 52.6668 1.64981 53.3133 0.745107C53.9613 -0.161732 55.0871 -0.253625 55.8277 0.53986L59.3915 4.35802C59.7782 4.77232 60 5.37085 60 6Z"
                      fill="#D8DBE4"/>
              </svg>

            </div>
          </div>

        </div>
        <div className="meno-stage" id={scoreJson.menopauseStage.stagetitle}>
          <div className="meno-stage-main-content">
            <div className="meno-stage-text">
              <div className="meno-stage-prehead">
                {scoreSummary.stageTitle}
              </div>
              <div className="meno-stage-title">
                {scoreJson.menopauseStage.stage}
              </div>
              <div className="meno-stage-description"
                   dangerouslySetInnerHTML={{__html: htmlDescriptionStage}}/>
            </div>
          </div>
          <div className="meno-stage-action-buttons">
            <a
              href={getTranslatedMessage("become_member_link", {})}
              target="_blank"
              className="button whatsapp"
              onClick={() => trackEvent(`Dashboard-Stage Click on ${getTranslatedMessage('become_member')} button`, 'Monepause stage section')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1678_1939)">
                  <path fillRule="evenodd" clipRule="evenodd"
                        d="M17.0859 2.90417C15.2061 1.03232 12.7059 0.000949696 10.042 0C4.55283 0 0.08547 4.44221 0.08356 9.90249C0.082605 11.648 0.54147 13.3518 1.41288 14.8533L0 19.9854L5.27909 18.6083C6.7335 19.3976 8.37128 19.813 10.0377 19.8135H10.042C15.5302 19.8135 19.9981 15.3708 20 9.91055C20.0009 7.26425 18.9662 4.7765 17.0859 2.90465V2.90417ZM10.042 18.1411H10.0387C8.55367 18.1407 7.09689 17.7436 5.82583 16.9939L5.52357 16.8154L2.39078 17.6325L3.22686 14.5949L3.03013 14.2834C2.20169 12.9729 1.76383 11.4581 1.76479 9.90298C1.7667 5.36484 5.47963 1.67241 10.0454 1.67241C12.2561 1.67336 14.3342 2.53047 15.8969 4.08655C17.4598 5.64216 18.3197 7.71061 18.3188 9.90961C18.3168 14.4482 14.6039 18.1407 10.042 18.1407V18.1411ZM14.5819 11.9766C14.3332 11.8527 13.1099 11.2544 12.8816 11.1718C12.6534 11.0891 12.4877 11.0478 12.322 11.2957C12.1563 11.5436 11.6793 12.1011 11.5342 12.2658C11.389 12.4311 11.2438 12.4515 10.9951 12.3275C10.7463 12.2036 9.94461 11.9424 8.99395 11.0996C8.25433 10.4433 7.75483 9.63326 7.60972 9.38536C7.46456 9.13751 7.59444 9.00359 7.71856 8.88061C7.83028 8.7695 7.96733 8.59144 8.09194 8.44707C8.21661 8.30271 8.25767 8.19923 8.34072 8.03442C8.42383 7.86917 8.38228 7.72486 8.32022 7.60088C8.25811 7.47696 7.76061 6.25895 7.55289 5.7637C7.35089 5.28127 7.14561 5.3468 6.99328 5.33872C6.84811 5.3316 6.68244 5.33018 6.51628 5.33018C6.35011 5.33018 6.08078 5.39191 5.85256 5.63978C5.62433 5.88762 4.98162 6.48641 4.98162 7.70392C4.98162 8.92144 5.87311 10.0986 5.99772 10.2639C6.12233 10.4291 7.75244 12.9282 10.2483 14.0004C10.8418 14.2554 11.3054 14.4078 11.6669 14.5218C12.2628 14.7103 12.8052 14.6838 13.234 14.6201C13.712 14.5489 14.7061 14.0213 14.9133 13.4434C15.1206 12.8655 15.1206 12.3698 15.0585 12.2667C14.9964 12.1637 14.8303 12.1015 14.5815 11.9776L14.5819 11.9766Z"
                        fill="white"/>
                </g>
                <defs>
                  <clipPath id="clip0_1678_1939">
                    <rect width="20" height="20" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span>{t('become_member')}</span>
            </a>
            {
              index > 0 && (
                <a
                  href={stageMoreLink}
                  target="_blank"
                  className="button button--secondary more-link"
                  onClick={() => trackEvent(`Dashboard-Stage Click on ${getTranslatedMessage('learn_about_stage')} button`, 'Monepause stage section')}
                >
                  <span>{t('learn_about_stage')}</span>
                  <svg width="16" height="16" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4.66602 9.99996H16.3327M16.3327 9.99996L10.4993 4.16663M16.3327 9.99996L10.4993 15.8333"
                      stroke="#3D497A"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )
            }
          </div>
          <div className="meno-stage-explanation"
               dangerouslySetInnerHTML={{__html: getTranslatedMessage("menopause_stage_determination", {})}}
          />
        </div>
        {index > -1 && (
          <div className="meno-score" id={scoreJson.menoScore.scoretitle}>
            <ScoreCircle
              score={scoreJson.menoScore.score}
              size={128}
              strokeWidth={8}
            />
            <div className="meno-stage-main-content">
              <div className="meno-stage-text">
                <div className="meno-stage-prehead">
                  {scoreSummary.scoreTitle}
                </div>
                <div className="meno-stage-title">
                  {scoreJson.menoScore.scorename}
                </div>
                <div className="meno-stage-description"
                     dangerouslySetInnerHTML={{__html: htmlDescriptionScore}}/>
              </div>
            </div>
            {
              index > -1 && (
                <div className="meno-stage-stats">
                  <div className="percent">
                    {index === 0 && t('premenopause_percentage')}
                    {index === 1 && t('perimenopause_percentage')}
                    {index === 2 && t('menopause_percentage')}
                    {index === 3 && t('postmenopause_percentage')}
                  </div>
                  <div className="text">
                    {index === 0 && t('premenopause_insights')}
                    {index === 1 && t('perimenopause_insights')}
                    {index === 2 && t('menopause_insights')}
                    {index === 3 && t('postmenopauseinsights')}
                  </div>
                </div>
              )
            }
            <div className="meno-stage-action-buttons meno-score-action-buttons">
              <a
                href={getTranslatedMessage("become_member_link", {})}
                target="_blank"
                className="button whatsapp"
                onClick={() => trackEvent(`Dashboard-Score Click on ${getTranslatedMessage('become_member')} button`, 'Monepause Score section')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_1678_1939)">
                    <path fillRule="evenodd" clipRule="evenodd"
                          d="M17.0859 2.90417C15.2061 1.03232 12.7059 0.000949696 10.042 0C4.55283 0 0.08547 4.44221 0.08356 9.90249C0.082605 11.648 0.54147 13.3518 1.41288 14.8533L0 19.9854L5.27909 18.6083C6.7335 19.3976 8.37128 19.813 10.0377 19.8135H10.042C15.5302 19.8135 19.9981 15.3708 20 9.91055C20.0009 7.26425 18.9662 4.7765 17.0859 2.90465V2.90417ZM10.042 18.1411H10.0387C8.55367 18.1407 7.09689 17.7436 5.82583 16.9939L5.52357 16.8154L2.39078 17.6325L3.22686 14.5949L3.03013 14.2834C2.20169 12.9729 1.76383 11.4581 1.76479 9.90298C1.7667 5.36484 5.47963 1.67241 10.0454 1.67241C12.2561 1.67336 14.3342 2.53047 15.8969 4.08655C17.4598 5.64216 18.3197 7.71061 18.3188 9.90961C18.3168 14.4482 14.6039 18.1407 10.042 18.1407V18.1411ZM14.5819 11.9766C14.3332 11.8527 13.1099 11.2544 12.8816 11.1718C12.6534 11.0891 12.4877 11.0478 12.322 11.2957C12.1563 11.5436 11.6793 12.1011 11.5342 12.2658C11.389 12.4311 11.2438 12.4515 10.9951 12.3275C10.7463 12.2036 9.94461 11.9424 8.99395 11.0996C8.25433 10.4433 7.75483 9.63326 7.60972 9.38536C7.46456 9.13751 7.59444 9.00359 7.71856 8.88061C7.83028 8.7695 7.96733 8.59144 8.09194 8.44707C8.21661 8.30271 8.25767 8.19923 8.34072 8.03442C8.42383 7.86917 8.38228 7.72486 8.32022 7.60088C8.25811 7.47696 7.76061 6.25895 7.55289 5.7637C7.35089 5.28127 7.14561 5.3468 6.99328 5.33872C6.84811 5.3316 6.68244 5.33018 6.51628 5.33018C6.35011 5.33018 6.08078 5.39191 5.85256 5.63978C5.62433 5.88762 4.98162 6.48641 4.98162 7.70392C4.98162 8.92144 5.87311 10.0986 5.99772 10.2639C6.12233 10.4291 7.75244 12.9282 10.2483 14.0004C10.8418 14.2554 11.3054 14.4078 11.6669 14.5218C12.2628 14.7103 12.8052 14.6838 13.234 14.6201C13.712 14.5489 14.7061 14.0213 14.9133 13.4434C15.1206 12.8655 15.1206 12.3698 15.0585 12.2667C14.9964 12.1637 14.8303 12.1015 14.5815 11.9776L14.5819 11.9766Z"
                          fill="white"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_1678_1939">
                      <rect width="20" height="20" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span>{t('become_member')}</span>
              </a>
              <a
                href={getTranslatedMessage("become_member_link", {})}
                target="_blank"
                className="button button--secondary more-link"
                onClick={() => trackEvent(`Dashboard-Score Click on ${getTranslatedMessage('discover_membership_textlink')} button`, 'Monepause Score section')}
              >
                <span>{t('discover_membership_textlink')}</span>
                <svg width="16" height="16" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.66602 9.99996H16.3327M16.3327 9.99996L10.4993 4.16663M16.3327 9.99996L10.4993 15.8333"
                    stroke="#3D497A"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
            <div className="meno-stage-explanation"
                 dangerouslySetInnerHTML={{__html: getTranslatedMessage("score_explanation", {})}}/>
          </div>
        )}
        {(scoreJson.keySymptoms.mostImpactful.length > 0 || scoreJson.keySymptoms.moderateImpact.length > 0) && (
          <div className="simptoms-recommendations" id="symptoms">
            <div className="symptoms-prehead">
              {scoreJson.keySymptoms.symptomstitle}
            </div>
            <div className="intro">
              <h2>{t('symptomsTitle')}</h2>
              <div className="intro-text">{t('symptomsDescription')}</div>
            </div>
            {(scoreJson.keySymptoms.mostImpactful.length > 0 || scoreJson.keySymptoms.moderateImpact.length > 0) && (
              <div className="action-buttons">
                {scoreJson.keySymptoms.mostImpactful.length > 0 && (
                  <button
                    className={`button ${currentTab === 'high' ? 'button--primary' : 'button--secondary'}`}
                    onClick={() => {
                      trackEvent(`Dashboard Symptoms Click on ${getTranslatedMessage('high_impact')} button`, 'Symptoms Section')
                      setCurrentTab('high')
                    }}
                  >
                    <span>{t('high_impact')}</span>
                  </button>
                )}
                {scoreJson.keySymptoms.moderateImpact.length > 0 && (
                  <button
                    className={`button ${currentTab === 'moderate' ? 'button--primary' : 'button--secondary'}`}
                    onClick={() => {
                      trackEvent(`Dashboard Symptoms Click on ${getTranslatedMessage('low_impact')} button`, 'Symptoms Section')
                      setCurrentTab('moderate')
                    }}
                  >
                    <span>{t('low_impact')}</span>
                  </button>
                )}
              </div>
            )}
            {
              scoreJson.keySymptoms.mostImpactful && scoreJson.keySymptoms.mostImpactful.map((s, index) => (
                <div
                  className={`symptom high symptom${index} ${s.isMentalHealth ? '' : ''} ${currentTab === 'high' ? '' : 'd-none'}`}
                  id="high_impact"
                  key={s.name}>
                  <div className="name">
                    {s.isMentalHealth && false ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.9998 9.00023V13.0002M11.9998 17.0002H12.0098M10.6151 3.89195L2.39019 18.0986C1.93398 18.8866 1.70588 19.2806 1.73959 19.6039C1.769 19.886 1.91677 20.1423 2.14613 20.309C2.40908 20.5002 2.86435 20.5002 3.77487 20.5002H20.2246C21.1352 20.5002 21.5904 20.5002 21.8534 20.309C22.0827 20.1423 22.2305 19.886 22.2599 19.6039C22.2936 19.2806 22.0655 18.8866 21.6093 18.0986L13.3844 3.89195C12.9299 3.10679 12.7026 2.71421 12.4061 2.58235C12.1474 2.46734 11.8521 2.46734 11.5935 2.58235C11.2969 2.71421 11.0696 3.10679 10.6151 3.89195Z"
                          stroke="#FF4589" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>

                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#3D497A" strokeWidth="2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                      </svg>
                    )}
                    {t(`${s.dataPointName.replaceAll(' ', '')}_name`)}
                  </div>
                  <div className="description"
                       dangerouslySetInnerHTML={{__html: getTranslatedMessage(`${s.dataPointName?.replaceAll(" ", "")}_description`, {})}}/>
                  <div style={{display: "flex", gap: '16px', flexWrap: 'wrap'}}>
                    <a
                      href={getTranslatedMessage('become_member_link', {})}
                      target="_blank"
                      className="button whatsapp"
                      onClick={() => trackEvent(`Dashboard Impactful Symptom Click on ${getTranslatedMessage('talk_to_doctor')} button`, 'Impactful Symptom')}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_1678_1939)">
                          <path fillRule="evenodd" clipRule="evenodd"
                                d="M17.0859 2.90417C15.2061 1.03232 12.7059 0.000949696 10.042 0C4.55283 0 0.08547 4.44221 0.08356 9.90249C0.082605 11.648 0.54147 13.3518 1.41288 14.8533L0 19.9854L5.27909 18.6083C6.7335 19.3976 8.37128 19.813 10.0377 19.8135H10.042C15.5302 19.8135 19.9981 15.3708 20 9.91055C20.0009 7.26425 18.9662 4.7765 17.0859 2.90465V2.90417ZM10.042 18.1411H10.0387C8.55367 18.1407 7.09689 17.7436 5.82583 16.9939L5.52357 16.8154L2.39078 17.6325L3.22686 14.5949L3.03013 14.2834C2.20169 12.9729 1.76383 11.4581 1.76479 9.90298C1.7667 5.36484 5.47963 1.67241 10.0454 1.67241C12.2561 1.67336 14.3342 2.53047 15.8969 4.08655C17.4598 5.64216 18.3197 7.71061 18.3188 9.90961C18.3168 14.4482 14.6039 18.1407 10.042 18.1407V18.1411ZM14.5819 11.9766C14.3332 11.8527 13.1099 11.2544 12.8816 11.1718C12.6534 11.0891 12.4877 11.0478 12.322 11.2957C12.1563 11.5436 11.6793 12.1011 11.5342 12.2658C11.389 12.4311 11.2438 12.4515 10.9951 12.3275C10.7463 12.2036 9.94461 11.9424 8.99395 11.0996C8.25433 10.4433 7.75483 9.63326 7.60972 9.38536C7.46456 9.13751 7.59444 9.00359 7.71856 8.88061C7.83028 8.7695 7.96733 8.59144 8.09194 8.44707C8.21661 8.30271 8.25767 8.19923 8.34072 8.03442C8.42383 7.86917 8.38228 7.72486 8.32022 7.60088C8.25811 7.47696 7.76061 6.25895 7.55289 5.7637C7.35089 5.28127 7.14561 5.3468 6.99328 5.33872C6.84811 5.3316 6.68244 5.33018 6.51628 5.33018C6.35011 5.33018 6.08078 5.39191 5.85256 5.63978C5.62433 5.88762 4.98162 6.48641 4.98162 7.70392C4.98162 8.92144 5.87311 10.0986 5.99772 10.2639C6.12233 10.4291 7.75244 12.9282 10.2483 14.0004C10.8418 14.2554 11.3054 14.4078 11.6669 14.5218C12.2628 14.7103 12.8052 14.6838 13.234 14.6201C13.712 14.5489 14.7061 14.0213 14.9133 13.4434C15.1206 12.8655 15.1206 12.3698 15.0585 12.2667C14.9964 12.1637 14.8303 12.1015 14.5815 11.9776L14.5819 11.9766Z"
                                fill="white"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_1678_1939">
                            <rect width="20" height="20" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                      <span>{t('talk_to_doctor')}</span>
                    </a>
                    <a
                      href={getTranslatedMessage(`${s.dataPointName?.replaceAll(" ", "")}_link`, {})}
                      target="_blank"
                      className="button button--secondary"
                      onClick={() => trackEvent(`Dashboard Impactful Symptom Click on ${getTranslatedMessage('symptom_link_text')} button`, 'Impactful Symptom')}
                    >
                      <span>{t('symptom_link_text')}</span>
                      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M4.66602 9.99996H16.3327M16.3327 9.99996L10.4993 4.16663M16.3327 9.99996L10.4993 15.8333"
                          stroke="#3D497A"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>

                </div>
              ))
            }
            {
              scoreJson.keySymptoms.moderateImpact && scoreJson.keySymptoms.moderateImpact.map(s => (
                <div className={`symptom symptom0 moderate ${currentTab === 'moderate' ? '' : 'd-none'}`} id="low_impact"
                     key={s.name}>
                  <div className="name">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#3D497A" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round"/>
                    </svg>
                    {t(`${s.dataPointName.replaceAll(' ', '')}_name`)}/>
                  </div>
                  <div className="description"
                       dangerouslySetInnerHTML={{__html: getTranslatedMessage(`${s.dataPointName?.replaceAll(" ", "")}_description`, {})}}/>
                  <div style={{display: "flex", gap: '16px', flexWrap: 'wrap', alignItems: 'center'}}>
                    <a
                      href={getTranslatedMessage('become_member_link', {})}
                      target="_blank"
                      className="button whatapp"
                      onClick={() => trackEvent(`Dashboard Moderate Symptom Click on ${getTranslatedMessage('talk_to_doctor')} button`, 'Moderate Symptom')}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_1678_1939)">
                          <path fillRule="evenodd" clipRule="evenodd"
                                d="M17.0859 2.90417C15.2061 1.03232 12.7059 0.000949696 10.042 0C4.55283 0 0.08547 4.44221 0.08356 9.90249C0.082605 11.648 0.54147 13.3518 1.41288 14.8533L0 19.9854L5.27909 18.6083C6.7335 19.3976 8.37128 19.813 10.0377 19.8135H10.042C15.5302 19.8135 19.9981 15.3708 20 9.91055C20.0009 7.26425 18.9662 4.7765 17.0859 2.90465V2.90417ZM10.042 18.1411H10.0387C8.55367 18.1407 7.09689 17.7436 5.82583 16.9939L5.52357 16.8154L2.39078 17.6325L3.22686 14.5949L3.03013 14.2834C2.20169 12.9729 1.76383 11.4581 1.76479 9.90298C1.7667 5.36484 5.47963 1.67241 10.0454 1.67241C12.2561 1.67336 14.3342 2.53047 15.8969 4.08655C17.4598 5.64216 18.3197 7.71061 18.3188 9.90961C18.3168 14.4482 14.6039 18.1407 10.042 18.1407V18.1411ZM14.5819 11.9766C14.3332 11.8527 13.1099 11.2544 12.8816 11.1718C12.6534 11.0891 12.4877 11.0478 12.322 11.2957C12.1563 11.5436 11.6793 12.1011 11.5342 12.2658C11.389 12.4311 11.2438 12.4515 10.9951 12.3275C10.7463 12.2036 9.94461 11.9424 8.99395 11.0996C8.25433 10.4433 7.75483 9.63326 7.60972 9.38536C7.46456 9.13751 7.59444 9.00359 7.71856 8.88061C7.83028 8.7695 7.96733 8.59144 8.09194 8.44707C8.21661 8.30271 8.25767 8.19923 8.34072 8.03442C8.42383 7.86917 8.38228 7.72486 8.32022 7.60088C8.25811 7.47696 7.76061 6.25895 7.55289 5.7637C7.35089 5.28127 7.14561 5.3468 6.99328 5.33872C6.84811 5.3316 6.68244 5.33018 6.51628 5.33018C6.35011 5.33018 6.08078 5.39191 5.85256 5.63978C5.62433 5.88762 4.98162 6.48641 4.98162 7.70392C4.98162 8.92144 5.87311 10.0986 5.99772 10.2639C6.12233 10.4291 7.75244 12.9282 10.2483 14.0004C10.8418 14.2554 11.3054 14.4078 11.6669 14.5218C12.2628 14.7103 12.8052 14.6838 13.234 14.6201C13.712 14.5489 14.7061 14.0213 14.9133 13.4434C15.1206 12.8655 15.1206 12.3698 15.0585 12.2667C14.9964 12.1637 14.8303 12.1015 14.5815 11.9776L14.5819 11.9766Z"
                                fill="white"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_1678_1939">
                            <rect width="20" height="20" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>

                      <span>{t('talk_to_doctor')}</span>
                    </a>
                    <a
                      href={getTranslatedMessage(`${s.dataPointName?.replaceAll(" ", "")}_link`, {})}
                      target="_blank"
                      className="button button--secondary"
                      onClick={() => trackEvent(`Dashboard Moderate Symptom Click on ${getTranslatedMessage('symptom_link_text')} button`, 'Moderate Symptom')}
                    >
                      <span>{t('symptom_link_text')}</span>
                      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M4.66602 9.99996H16.3327M16.3327 9.99996L10.4993 4.16663M16.3327 9.99996L10.4993 15.8333"
                          stroke="#3D497A"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              ))
            }
          </div>
        )}
        <div className="box" id="whats_next">
          <div className="content">
            <div className="title"
                 dangerouslySetInnerHTML={{__html: getTranslatedMessage("membership_title", {})}}/>
            <div className="description"
                 dangerouslySetInnerHTML={{__html: getTranslatedMessage("membership_bullets", {})}}/>
            <div className="actions">
              <a
                href={getTranslatedMessage('membership_ctalink', {})}
                target="_blank"
                className="button button--secondary"
                onClick={() => trackEvent(`Dashboard What's Next Click on ${getTranslatedMessage('membership_cta')} button`, 'Next steps section')}
              >
                <span>{t('membership_cta')}</span>
              </a>
            </div>
          </div>
          <div className="info-box">
            <div className="stats">{t('membership_percentage')}</div>
            <div className="stats-desc">{t('membership_insights')}</div>
          </div>
        </div>
        <div className="box" id="book_call">
          <div className="content">
            <div className="title"
                 dangerouslySetInnerHTML={{__html: getTranslatedMessage("book_call_content_title", {})}}/>
            <div className="description"
                 dangerouslySetInnerHTML={{__html: getTranslatedMessage("book_call_content_description", {})}}/>
            <div className="actions">
              <a
                href="https://evrbloom.ro/pages/dr-virginia-lazar"
                target="_blank"
                className="button button--primary"
                onClick={() => trackEvent(`Dashboard Book a call Click on ${getTranslatedMessage('book_call')} button`, 'Book a call section')}
              >
                <span>{t('book_call')}</span>
              </a>
            </div>
          </div>
          <div className="info-box-dr">
            <img src={virginiaImage}/>
            <div className="dr-info">
              <div className="dr-name">Dr. Virginia Lazar</div>
              <div className="dr-desc">{t('book_call_dr_info')}</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}