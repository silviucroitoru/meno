import SideBar from "../components/SideBar.jsx";
import mixpanel from "mixpanel-browser";
import Menoscore from "../LeadQuestionAnswer/Menoscore.jsx";
import Loader from "../LeadQuestionAnswer/Loader.jsx";
import './dashboard.css'
import {useEffect, useState} from "react";
export default function Dashboard() {
  const [scoreJson, setScoreJson] = useState(null);
  const [scoreSummary, setScoreSummary] = useState({});
  const [loadError, setLoadError] = useState(null);
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
    const requestOptions = {
      method: "GET",
    };

    const storedLang = (localStorage.getItem('language') ?? 'sr').toUpperCase();
    const base = import.meta.env.VITE_API_URL;
    if (!base) {
      setLoadError("Missing VITE_API_URL (Supabase functions base URL).");
      return;
    }
    fetch(`${base}/generate-score?submissionId=${localStorage.getItem('SubmissionID') ?? 9999999}&language=${storedLang}`, requestOptions)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result?.error ?? result?.message ?? `generate-score failed (${response.status})`);
        }
        if (typeof result?.content !== "string") {
          throw new Error("generate-score: missing content in response");
        }
        return result;
      })
      .then((result) => {
        const fullJson = JSON.parse(result.content)
        console.log(fullJson)
        setScoreSummary({
          scoreTitle: fullJson.menoScore?.scoretitle || null,
          stageTitle: fullJson.menopauseStage?.stagetitle || null,
          symptomsTitle: fullJson.keySymptoms?.moderateImpact?.length > 0 || fullJson.keySymptoms?.mostImpactful?.length > 0 ? fullJson.keySymptoms.symptomstitle : null,
          recommendationsTitle: (fullJson.anxietyRecommendation || fullJson.depressionRecommendation) ? "recommendations" : null
        })
        setScoreJson(fullJson);
        setLoadError(null);
      })
      .catch((error) => {
        console.error(error);
        setLoadError(error?.message ?? "Failed to load report");
      });
   // eslint-disable-next-line
  }, []);
  return (
    <div className="dashboard">
      {scoreJson ? (
        <>
          <SideBar scoreSummary={scoreSummary} />
          <div className="pageContent">
            <Menoscore scoreJson={scoreJson} scoreSummary={scoreSummary} />
          </div>
        </>
      ) : loadError ? (
        <div className="pageContent" style={{ padding: "2rem", maxWidth: 560, margin: "0 auto" }}>
          <p style={{ color: "#b00020", marginBottom: "0.75rem" }}>Could not load your report.</p>
          <p style={{ color: "#444", fontSize: 14 }}>{loadError}</p>
          <p style={{ color: "#666", fontSize: 13, marginTop: "1rem" }}>
            Check the browser console and Edge Function logs for details.
          </p>
        </div>
      ) : (
        <Loader />
      )}

    </div>
  );
}