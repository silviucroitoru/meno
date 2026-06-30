import "./styles/sidebar.css"
import mixpanel from "mixpanel-browser";
import { useTranslate } from "../i18n/useTranslate";

export default function SideBar({scoreSummary}) {
  const { t } = useTranslate();

  const scrollToIdWithOffset = (id, offsetPx = 32) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - offsetPx;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/primea_logo.png" alt="Primea" />
      </div>
      <div className="dashboardMenu">
        {scoreSummary.stageTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Stage`, { source: 'SideBar' })
                    scrollToIdWithOffset(scoreSummary.stageTitle)}
                  }
          >
            {scoreSummary.stageTitle}
          </button>
        )}
        {scoreSummary.scoreTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Score`, { source: 'SideBar' })
                    scrollToIdWithOffset(scoreSummary.scoreTitle)
                  }}
          >
            {scoreSummary.scoreTitle}
          </button>
        )}
        {scoreSummary.symptomsTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Symptoms`, { source: 'SideBar' })
                    scrollToIdWithOffset('symptoms')
                  }}
          >
            {scoreSummary.symptomsTitle}
          </button>
        )}
        {scoreSummary.recommendationsTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Recommendations`, { source: 'SideBar' })
                    scrollToIdWithOffset('recommendations')
                  }}
          >
            {scoreSummary.recommendationsTitle}
          </button>
        )}
      </div>
    </div>
  );
}