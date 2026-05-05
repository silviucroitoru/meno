import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminSignIn, getAdminSession } from "../data/adminApi";
import "./admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAdminSession().then((session) => {
      if (!cancelled && session) {
        navigate(redirectTo, { replace: true });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, redirectTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await adminSignIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <form className="admin-login-card" onSubmit={handleSubmit} noValidate>
        <div className="admin-login-brand">
          <img src="/primea_logo.png" alt="Primea" />
        </div>
        <h1>Admin sign in</h1>
        <p className="admin-login-sub">Access submissions and metrics.</p>

        <div className="admin-form-field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="admin-form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="button admin-submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

