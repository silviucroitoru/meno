import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "./Dashboard/Dashboard.jsx"
import mixpanel from 'mixpanel-browser';
import Questionaire from "./Questionaire/Questionaire.jsx"
import './assets/base.css'
// function ProtectedRoute({ element: Component }) {
//   const  isAuthenticated  = true;
//
//   return isAuthenticated ? <Component /> : <Navigate to="/login" />;
// }
function App() {
  mixpanel.init('0e17fc0146b24ead1c281493c0fa07bd', { debug: true });
  return (
    <Router>
      <Routes>
        <Route path="/questionnaire" element={<Questionaire />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/*<Route path="/login" element={<Login />} />*/}
        {/*<Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />*/}
      </Routes>
    </Router>
  );
}

export default App;
