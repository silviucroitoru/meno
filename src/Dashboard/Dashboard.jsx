import SideBar from "../components/SideBar.jsx";
import mixpanel from "mixpanel-browser";
import Menoscore from "../LeadQuestionAnswer/Menoscore.jsx";
import Loader from "../LeadQuestionAnswer/Loader.jsx";
import './dashboard.css'
import {useEffect, useState} from "react";
import {mockData} from "../LeadQuestionAnswer/mockData.jsx";
export default function Dashboard() {
  const [scoreJson, setScoreJson] = useState(null);
  const [display, setDisplay] = useState(false);
  const [scoreSummary, setScoreSummary] = useState({});
  const language = localStorage.getItem('language')
  useEffect(() => {
    // Allow deep-linking into a specific dashboard:
    // /dashboard?submissionId=123&language=sr
    const params = new URLSearchParams(window.location.search);
    const urlSubmissionId = params.get('submissionId');
    const urlLanguage = params.get('language')?.toLowerCase();
    const urlUserName = params.get('userName');
    const urlEmail = params.get('email');

    if (urlSubmissionId) {
      localStorage.setItem('SubmissionID', urlSubmissionId);
    }
    if (urlLanguage === 'en' || urlLanguage === 'ro' || urlLanguage === 'sr') {
      localStorage.setItem('language', urlLanguage);
    }
    if (urlUserName) {
      localStorage.setItem('userName', urlUserName);
    }
    if (urlEmail) {
      localStorage.setItem('bloomEmail', urlEmail);
    }

    mixpanel.identify(localStorage.getItem('SubmissionID'))
    mixpanel.people.set({ '$name': localStorage.getItem('userName'),
                          '$email': localStorage.getItem('bloomEmail'),
    });
    setTimeout(() => {setDisplay(true)}, 13600)
    const requestOptions = {
      method: "GET",
    };

    const storedLang = (localStorage.getItem('language') ?? 'sr').toUpperCase();
    fetch(`${import.meta.env.VITE_API_URL}/generate-score?submissionId=${localStorage.getItem('SubmissionID') ?? 9999999}&language=${storedLang}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        const fullJson = JSON.parse(result.content)
        console.log(fullJson)
        setScoreSummary({
          scoreTitle: fullJson.menoScore?.scoretitle || null,
          stageTitle: fullJson.menopauseStage?.stagetitle || null,
          symptomsTitle: fullJson.keySymptoms?.moderateImpact?.length > 0 || fullJson.keySymptoms?.mostImpactful?.length > 0 ? fullJson.keySymptoms.symptomstitle : null,
          recommendationsTitle: (fullJson.anxietyRecommendation || fullJson.depressionRecommendation) ? "recommendations" : null
        })
        setScoreJson(fullJson)
      })
      .catch((error) => console.error(error));
   // eslint-disable-next-line
  }, []);
  return (
    <div className="dashboard">
      {scoreJson && display ? (
        <>
          <SideBar scoreSummary={scoreSummary} />
          <div className="pageContent">
            <Menoscore scoreJson={scoreJson} scoreSummary={scoreSummary} />
          </div>
        </>
      ) : (
        <Loader />
      )}

    </div>
  );
}