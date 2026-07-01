import { useEffect, useState } from "react";
import mixpanel from "mixpanel-browser";
import IRSideBar from "./IRSideBar.jsx";
import IRReport from "./IRReport.jsx";
import "../Dashboard/dashboard.css";

export default function IRResults() {
  const [reportData, setReportData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const token = mixpanel.get_config?.("token");
    if (token) mixpanel.track("[Page View] IR Results", { source: "InsulinResistance" });

    const base = import.meta.env.VITE_API_URL;
    if (!base) {
      setLoadError("Missing VITE_API_URL.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const submissionId = params.get("submissionId") || localStorage.getItem("IRSubmissionID");
    if (!submissionId?.trim()) {
      setLoadError("No submission found. Complete the questionnaire first.");
      return;
    }

    fetch(`${base}/generate-ir-report?submissionId=${encodeURIComponent(submissionId.trim())}`)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result?.error ?? `Request failed (${response.status})`);
        }
        return result;
      })
      .then((result) => {
        setReportData(result);
        setLoadError(null);
      })
      .catch((error) => {
        console.error(error);
        setLoadError(error?.message ?? "Failed to load report");
      });
  }, []);

  return (
    <div className="dashboard">
      {reportData ? (
        <>
          <IRSideBar />
          <div className="pageContent">
            <IRReport recommendations={reportData.recommendations} />
          </div>
        </>
      ) : loadError ? (
        <div className="pageContent" style={{ padding: "2rem", maxWidth: 560, margin: "0 auto" }}>
          <p style={{ color: "#b00020", marginBottom: "0.75rem" }}>Could not load your report.</p>
          <p style={{ color: "#444", fontSize: 14 }}>{loadError}</p>
        </div>
      ) : null}
    </div>
  );
}
