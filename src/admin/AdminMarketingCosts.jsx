import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  adminSignOut,
  fetchAdminMarketingAccess,
  fetchAdminMarketingRange,
  setAdminMarketingDay,
} from "../data/adminApi";
import { TIMEFRAMES, computeRange, formatChartDay } from "./adminDateRange";
import "./admin.css";

export default function AdminMarketingCosts() {
  const navigate = useNavigate();

  const [allowed, setAllowed] = useState(null);
  const [timeframe, setTimeframe] = useState("last7");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminMarketingAccess()
      .then((res) => {
        if (res?.allowed) {
          setAllowed(true);
        } else {
          setAllowed(false);
          navigate("/admin", { replace: true });
        }
      })
      .catch(() => {
        setAllowed(false);
        navigate("/admin", { replace: true });
      });
  }, [navigate]);

  const loadData = useCallback(() => {
    if (allowed !== true) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const range = computeRange(timeframe);
    fetchAdminMarketingRange(range)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [timeframe, allowed]);

  useEffect(() => {
    const cancel = loadData();
    return cancel;
  }, [loadData]);

  const handleSignOut = async () => {
    await adminSignOut();
    navigate("/admin/login", { replace: true });
  };

  const startEdit = (day, currentValue) => {
    setEditingDay(day);
    setEditValue(currentValue > 0 ? String(currentValue) : "");
  };

  const cancelEdit = () => {
    setEditingDay(null);
    setEditValue("");
  };

  const saveEdit = async (day) => {
    const parsed = parseFloat(editValue);
    if (isNaN(parsed) || parsed < 0) return;
    setSaving(true);
    try {
      await setAdminMarketingDay(day, parsed);
      setEditingDay(null);
      setEditValue("");
      loadData();
    } catch (err) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e, day) => {
    if (e.key === "Enter") saveEdit(day);
    if (e.key === "Escape") cancelEdit();
  };

  if (allowed === null) {
    return (
      <div className="admin-shell">
        <div className="admin-container">
          <div className="admin-loading">Checking access…</div>
        </div>
      </div>
    );
  }

  const rows = data?.rows ?? [];
  const fmtUsd = (v) => v != null ? `$${Number(v).toFixed(2)}` : "—";

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a className="admin-header-brand" href="/admin">
          <img src="/primea_logo.png" alt="Primea" />
        </a>
        <div className="admin-header-actions">
          <Link to="/admin" className="admin-ghost-button">Dashboard</Link>
          <button type="button" className="admin-ghost-button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="admin-container">
        <section className="admin-section">
          <div className="admin-section-prehead">Marketing</div>
          <h2 className="admin-section-title">Daily Ad Spend</h2>

          <div className="admin-timeframe-bar">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.key}
                type="button"
                className={`admin-timeframe-btn${timeframe === tf.key ? " admin-timeframe-btn--active" : ""}`}
                onClick={() => setTimeframe(tf.key)}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {loading && <div className="admin-loading">Loading…</div>}
          {error && !loading && <div className="admin-error">{error}</div>}

          {!loading && !error && data && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Spend (USD)</th>
                      <th>Submissions</th>
                      <th>CPA (USD)</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          <div className="admin-empty">No data for this period.</div>
                        </td>
                      </tr>
                    )}
                    {rows.map((row) => {
                      const isEditing = editingDay === row.day;
                      return (
                        <tr key={row.day}>
                          <td data-label="Date" className="admin-col-muted">
                            {formatChartDay(row.day)}
                          </td>
                          <td data-label="Spend (USD)">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="admin-inline-input"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, row.day)}
                                autoFocus
                                disabled={saving}
                              />
                            ) : (
                              <span>{row.spend_usd > 0 ? fmtUsd(row.spend_usd) : "—"}</span>
                            )}
                          </td>
                          <td data-label="Submissions" className="admin-col-muted">
                            {row.successful_submissions}
                          </td>
                          <td data-label="CPA (USD)">
                            {row.cost_per_submission_usd != null ? fmtUsd(row.cost_per_submission_usd) : "—"}
                          </td>
                          <td>
                            {isEditing ? (
                              <span className="admin-inline-actions">
                                <button
                                  type="button"
                                  className="admin-ghost-button"
                                  onClick={() => saveEdit(row.day)}
                                  disabled={saving}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="admin-ghost-button"
                                  onClick={cancelEdit}
                                  disabled={saving}
                                >
                                  Cancel
                                </button>
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="admin-ghost-button"
                                onClick={() => startEdit(row.day, row.spend_usd)}
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          )}
        </section>
      </main>
    </div>
  );
}
