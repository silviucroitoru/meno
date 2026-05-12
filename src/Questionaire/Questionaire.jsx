import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mixpanel from "mixpanel-browser";
import Page from "./components/Page.jsx";
import './Questionaire.css'
import HeaderArea from "./components/HeaderArea.jsx";

const GOOGLE_CLICK_STORAGE_KEY = "meno_google_click_v1";
const GOOGLE_CLICK_PARAM_KEYS = ["gclid", "wbraid", "gbraid"];
const GOOGLE_CLICK_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

function persistGoogleClickIdsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const patch = {};
  for (const key of GOOGLE_CLICK_PARAM_KEYS) {
    const v = params.get(key)?.trim();
    if (v) patch[key] = v;
  }
  if (Object.keys(patch).length === 0) return;
  try {
    const prev = JSON.parse(localStorage.getItem(GOOGLE_CLICK_STORAGE_KEY) || "{}");
    localStorage.setItem(
      GOOGLE_CLICK_STORAGE_KEY,
      JSON.stringify({ ...prev, ...patch, capturedAt: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

function getQuestionnaireQueryString(language) {
  const qs = new URLSearchParams({ language });
  try {
    const raw = localStorage.getItem(GOOGLE_CLICK_STORAGE_KEY);
    if (!raw) return qs.toString();
    const o = JSON.parse(raw);
    if (o.capturedAt && Date.now() - o.capturedAt > GOOGLE_CLICK_MAX_AGE_MS) {
      localStorage.removeItem(GOOGLE_CLICK_STORAGE_KEY);
      return qs.toString();
    }
    for (const key of GOOGLE_CLICK_PARAM_KEYS) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) qs.set(key, v.trim().slice(0, 500));
    }
  } catch {
    /* ignore */
  }
  return qs.toString();
}

export default function Questionaire() {
  function getLanguageFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('language')?.toLowerCase();
    return lang === 'en' || lang === 'ro' || lang === 'sr' ? lang.toUpperCase() : null;
  }
  const [questionnaire, setQuestionnaire] = useState(null);
  const [language] = useState(getLanguageFromURL() ?? 'SR');
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [submissionId, setSubmissionId] = useState();
  const [progressPages, setProgressPages] = useState([1]);
  const [currentPage, setCurrentPage] = useState(null);
  const topicPageRef = useRef(null);
  const headerRef = useRef(null);
  const originalHeight = useRef(0);
  const [extraHeight, setExtraHeight] = useState(window.innerWidth < 990 ? 56 : 64);
  useEffect(() => {
    mixpanel.track('[Page View] Questionnaire', {source: 'Questionnaire'})
    const handleResize = () => {
      setExtraHeight(window.innerWidth < 990 ? 56 : 64);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    const uiLang = new URLSearchParams(window.location.search).get('language')?.toLowerCase();
    localStorage.setItem("language", uiLang === 'en' || uiLang === 'ro' || uiLang === 'sr' ? uiLang : 'sr');
    if (topicPageRef.current) {
      originalHeight.current = topicPageRef.current.clientHeight;
    }
    const requestOptions = {
      method: "GET",
    };
    persistGoogleClickIdsFromUrl();
    const questionnaireQs = getQuestionnaireQueryString(language);
    fetch(`${import.meta.env.VITE_API_URL}/get-questionnaire?${questionnaireQs}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setSubmissionId(result.SubmissionID)
        setQuestionnaire(result.questionnaire);
        setCurrentPage(result.questionnaire.info[0])
        localStorage.setItem('SubmissionID', result.SubmissionID);
      })
      .catch((error) => console.error(error));
    // eslint-disable-next-line
  }, []);
  const next = async (pageNo, dataPointId, dataPointName, a, type) => {
    if (type === "first_name") {
      setUserName(a)
      localStorage.setItem('userName', a)
    }
    if (type === "email") {
      localStorage.setItem('bloomEmail', a)
    }
    if(type !== "email"){
      setProgressPages([...progressPages, pageNo])
      setCurrentPage(questionnaire.info?.find((page) => page.position === pageNo));
    }
    mixpanel.track(`[Page ${pageNo} View] Questionnaire`, {source: 'Questionnaire'})
    if(type !== "intro" && type !== "media") {
      const data = {
        "SubmissionID": submissionId,
        "language": language,
        "DataPointName": dataPointName,
        "Response": a
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/update-response`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        if(type === "email") {
          navigate('/dashboard')
        }
        return result;
      } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow error to be handled outside
      }
    }
  }

  const back = () => {
    const pageNo = questionnaire.info.find(page => page.position === progressPages[progressPages.length - 2]);
    setCurrentPage(questionnaire.info.find(page => page.position === progressPages[progressPages.length - 2]));
    setProgressPages(prevItems => prevItems.slice(0, -1));
    mixpanel.track(`[Page ${pageNo} View] Questionnaire`, {source: 'Questionnaire'})
  }
  if( !questionnaire){
    return (<h1></h1>)
  }
  const dynamicHeight = currentPage.position === 1 ? "100dvh" : `calc(100dvh + ${extraHeight}px)`;

  return (
    <div className={`${currentPage.position === 1 ? 'active' : ''} no-scroll`} style={{height: dynamicHeight}}>
      <div className="topic-header" ref={headerRef}>
        <HeaderArea
          currentPage={currentPage}
          progressPages={progressPages}
          qLength={questionnaire.info.length}
        />
      </div>
      <div className="page-narrow" id="topic-page-container" ref={topicPageRef}>
        <div className="page-container">
          {
            questionnaire?.info.map((page) => {
              return (
                <div key={page.position} className={`page page-width ${currentPage.position === page.position ? 'active' : 'd-none'}`}
                     id={`page${page.position}`}>
                  <Page
                    page={page}
                    next={next}
                    back={back}
                    currentPage={currentPage}
                    userName={userName}
                    isActive
                    language={language}
                  />
                </div>

              );
            })
          }
        </div>
      </div>
    </div>

  );
}