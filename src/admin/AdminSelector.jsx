import { Link, useNavigate } from "react-router-dom";
import { adminSignOut } from "../data/adminApi";
import "./admin.css";

export default function AdminSelector() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await adminSignOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a className="admin-header-brand" href="/admin">
          <img src="/primea_logo.png" alt="Primea" />
        </a>
        <div className="admin-header-actions">
          <button type="button" className="admin-ghost-button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="admin-container">
        <section className="admin-section" aria-labelledby="admin-selector-heading">
          <div className="admin-section-prehead">Dashboards</div>
          <h2 id="admin-selector-heading" className="admin-section-title">Select a dashboard</h2>

          <div className="admin-selector-grid">
            <Link to="/admin/menopause" className="admin-selector-card">
              <div className="admin-selector-card__title">Menopause</div>
              <div className="admin-selector-card__desc">Menoscore submissions, reports, and marketing costs.</div>
            </Link>
            <Link to="/admin/contraception" className="admin-selector-card">
              <div className="admin-selector-card__title">Contraception</div>
              <div className="admin-selector-card__desc">Contraception submissions and marketing costs.</div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
