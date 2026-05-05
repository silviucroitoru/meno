import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAdminSession, onAdminAuthChange } from "../data/adminApi";
import "./admin.css";

export default function AdminRequireAuth({ children }) {
  const [status, setStatus] = useState("loading");
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    getAdminSession().then((session) => {
      if (cancelled) return;
      setStatus(session ? "authenticated" : "anonymous");
    });
    const unsubscribe = onAdminAuthChange((session) => {
      if (cancelled) return;
      setStatus(session ? "authenticated" : "anonymous");
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="admin-shell">
        <div className="admin-container">
          <div className="admin-loading">Checking session…</div>
        </div>
      </div>
    );
  }

  if (status === "anonymous") {
    const redirectTo = `${location.pathname}${location.search}`;
    return <Navigate to="/admin/login" replace state={{ from: redirectTo }} />;
  }

  return children;
}

