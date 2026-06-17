import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from "./Dashboard/Dashboard.jsx"
import mixpanel from 'mixpanel-browser';
import Questionaire from "./Questionaire/Questionaire.jsx"
import ContraceptionQuestionnaire from "./Contraception/ContraceptionQuestionnaire.jsx"
import ContraceptionResults from "./Contraception/ContraceptionResults.jsx"
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminMarketingCosts from "./admin/AdminMarketingCosts.jsx";
import AdminContraceptionDashboard from "./admin/AdminContraceptionDashboard.jsx";
import AdminContraceptionMarketingCosts from "./admin/AdminContraceptionMarketingCosts.jsx";
import AdminRequireAuth from "./admin/AdminRequireAuth.jsx";
import './assets/base.css'

const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;
if (mixpanelToken) {
  const mixpanelApiHost =
    import.meta.env.VITE_MIXPANEL_API_HOST || "https://api-eu.mixpanel.com";
  mixpanel.init(mixpanelToken, {
    debug: import.meta.env.DEV,
    api_host: mixpanelApiHost,
  });
}
// function ProtectedRoute({ element: Component }) {
//   const  isAuthenticated  = true;
//
//   return isAuthenticated ? <Component /> : <Navigate to="/login" />;
// }

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/questionnaire" replace />} />
        <Route path="/questionnaire" element={<Questionaire />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contraception" element={<ContraceptionQuestionnaire />} />
        <Route path="/contraception/results" element={<ContraceptionResults />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRequireAuth>
              <AdminDashboard />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/marketing-costs"
          element={
            <AdminRequireAuth>
              <AdminMarketingCosts />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/contraception"
          element={
            <AdminRequireAuth>
              <AdminContraceptionDashboard />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/contraception/marketing-costs"
          element={
            <AdminRequireAuth>
              <AdminContraceptionMarketingCosts />
            </AdminRequireAuth>
          }
        />
        {/*<Route path="/login" element={<Login />} />*/}
        {/*<Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />*/}
      </Routes>
    </Router>
  );
}

export default App;
