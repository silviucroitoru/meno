import "./styles/sidebar.css"
import { FormattedMessage } from "react-intl";
import mixpanel from "mixpanel-browser";
import { useTranslate } from "../i18n/useTranslate";

export default function SideBar({scoreSummary}) {
  const { t } = useTranslate();
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/primea_logo.png" alt="Primea" />
      </div>
      <div className="dashboardMenu">
        {scoreSummary.stageTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Stage`, {source: 'SideBar'})
                    document.getElementById(scoreSummary.stageTitle).scrollIntoView({behavior: "smooth"})}
                  }
          >
            {scoreSummary.stageTitle}
          </button>
        )}
        {scoreSummary.scoreTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Score`, {source: 'SideBar'})
                    document.getElementById(scoreSummary.scoreTitle).scrollIntoView({behavior: "smooth"})
                  }}
          >
            {scoreSummary.scoreTitle}
          </button>
        )}
        {scoreSummary.symptomsTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Symptoms"`, {source: 'SideBar'})
                    document.getElementById('symptoms').scrollIntoView({behavior: "smooth"})
                  }}
          >
            {scoreSummary.symptomsTitle}
          </button>
        )}
        {scoreSummary.recommendationsTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Recommendations"`, {source: 'SideBar'})
                    document.getElementById('recommendations').scrollIntoView({behavior: "smooth"})
                  }}
          >
            {scoreSummary.recommendationsTitle}
          </button>
        )}
        <button className="menuLink"
                onClick={() => {
                  mixpanel.track(`Dashboard-Sidebar Select Book a call`, {source: 'SideBar'})
                  document.getElementById('book_call').scrollIntoView({behavior: "smooth"})
                }}
        >
          <span>{t("book_call_sidebar_title")}</span>
          {/*<FormattedMessage id="book_call_sidebar_title"/>*/}
        </button>
      </div>
    </div>
  );
}