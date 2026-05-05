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
  mixpanel.init('81d3542c46dd3052b3d9d9ccb9023f01', {
    autocapture: false,
    debug: true,
  });
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
