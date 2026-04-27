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
    mixpanel.identify(localStorage.getItem('SubmissionID'))
    mixpanel.people.set({ '$name': localStorage.getItem('userName'),
                          '$email': localStorage.getItem('bloomEmail'),
    });
    const myHeaders = new Headers();
    myHeaders.append("X-Api-Key", `${import.meta.env.VITE_API_KEY}`);
    myHeaders.append("Content-Type", "application/json");
    setTimeout(() => {setDisplay(true)}, 13600)
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    fetch(`${import.meta.env.VITE_API_URL}/generate-score?submissionId=${localStorage.getItem('SubmissionID') ?? 9999999}&language=${language.toUpperCase() ?? 'RO'}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        const fullJson = JSON.parse(result.content)
        console.log(fullJson)
        setScoreSummary({
          scoreTitle: fullJson.menoScore?.scoretitle || null,
          stageTitle: fullJson.menopauseStage?.stagetitle || null,
          symptomsTitle: fullJson.keySymptoms?.moderateImpact?.length > 0 || fullJson.keySymptoms?.mostImpactful?.length > 0 ? fullJson.keySymptoms.symptomstitle : null,
          recommendationsTitle: (fullJson.anxietyRecommendation || fullJson.depressionRecommendation) ? "Recommendations" : null
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