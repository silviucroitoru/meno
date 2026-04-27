import { Route, Navigate } from 'react-router-dom';
// import { useAuth } from './auth'; // Replace with Amplify's useAuthenticator hook

function AuthenticatedRoute({ element: Component, ...rest }) {
  const { isAuthenticated } = true; // Check authentication status

  return isAuthenticated ? (
    <Route {...rest} element={<Component />} />
  ) : (
    <Navigate to="/login" />
  );
}

export default AuthenticatedRoute;
