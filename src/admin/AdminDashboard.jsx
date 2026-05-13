import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminSignOut, fetchAdminMetrics, fetchAdminSubmissions } from "../data/adminApi";
import "./admin.css";

const PAGE_SIZE = 50;

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("sr-RS", {
      timeZone: "Europe/Belgrade",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

function sortStageEntries(entries) {
  const order = new Map(
    ["Premenopause", "Perimenopause", "Menopause", "Postmenopause", "Undefined", "Neodređeno", "Nedefinită"]
      .map((k, i) => [k, i]),
  );
  return [...entries].sort((a, b) => {
    const ai = order.has(a[0]) ? order.get(a[0]) : 999;
    const bi = order.has(b[0]) ? order.get(b[0]) : 999;
    if (ai !== bi) return ai - bi;
    return (b[1] ?? 0) - (a[1] ?? 0);
  });
}

function Bars({ title, data }) {
  const entries = useMemo(() => sortStageEntries(Object.entries(data || {})), [data]);
  const total = entries.reduce((sum, [, v]) => sum + (Number(v) || 0), 0) || 0;

  return (
    <div className="admin-bars-card">
      <h3>{title}</h3>
      {entries.length === 0 ? (
        <div className="admin-empty">No data yet</div>
      ) : (
        entries.map(([key, count]) => {
          const raw = Number(count) || 0;
          const shareRaw = total > 0 ? (raw / total) * 100 : 0;
          const share = Math.round(shareRaw);
          const widthPct = Math.max(0, Math.min(100, shareRaw));
          return (
            <div className="admin-bar" key={key}>
              <span className="admin-bar-label">{key}</span>
              <span className="admin-bar-count">{raw} · {share}%</span>
              <div className="admin-bar-track">
                <div className="admin-bar-fill" style={{ width: `${widthPct}%` }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const [list, setList] = useState({ total: 0, rows: [], offset: 0, limit: PAGE_SIZE });
  const [listError, setListError] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const searchTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setMetricsLoading(true);
    setMetricsError(null);
    fetchAdminMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data);
      })
      .catch((err) => {
        if (!cancelled) setMetricsError(err?.message || "Failed to load metrics");
      })
      .finally(() => {
        if (!cancelled) setMetricsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setOffset(0);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  const loadList = useCallback(() => {
    let cancelled = false;
    setListLoading(true);
    setListError(null);
    fetchAdminSubmissions({ search: debouncedSearch, limit: PAGE_SIZE, offset })
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch((err) => {
        if (!cancelled) setListError(err?.message || "Failed to load submissions");
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, offset]);

  useEffect(() => {
    const cancel = loadList();
    return cancel;
  }, [loadList]);

  const handleSignOut = async () => {
    await adminSignOut();
    navigate("/admin/login", { replace: true });
  };

  const total = list.total || 0;
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingFrom = total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(total, offset + (list.rows?.length || 0));

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
        <section className="admin-section" aria-labelledby="admin-metrics-heading">
          <div className="admin-section-prehead">Overview</div>
          <h2 id="admin-metrics-heading" className="admin-section-title">Metrics</h2>

          {metricsLoading && <div className="admin-loading">Loading metrics…</div>}
          {metricsError && !metricsLoading && <div className="admin-error">{metricsError}</div>}

          {metrics && !metricsLoading && !metricsError && (
            <div className="admin-metrics-row">
              <div className="admin-metric-card admin-metric-card--compact">
                <div className="admin-metric-label">Successful submissions</div>
                <div className="admin-metric-value">{metrics.successfulSubmissions ?? 0}</div>
              </div>
              <div className="admin-metric-card admin-metric-card--compact">
                <div className="admin-metric-label">Questionnaire completion rate</div>
                <div className="admin-metric-value">
                  {Number(metrics.completionRatePct ?? 0).toFixed(1)}%
                </div>
              </div>
              <Bars title="By menopause stage" data={metrics.byStage} />
            </div>
          )}
        </section>

        <section className="admin-section" aria-labelledby="admin-submissions-heading">
          <div className="admin-section-prehead">Submissions</div>
          <h2 id="admin-submissions-heading" className="admin-section-title">All submissions</h2>

          <div className="admin-toolbar">
            <div className="admin-search">
              <input
                type="search"
                placeholder="Search name, email, stage…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search submissions"
              />
            </div>
            <div className="admin-toolbar-meta">
              {listLoading
                ? "Loading…"
                : total === 0
                  ? "No results"
                  : `Showing ${showingFrom}–${showingTo} of ${total}`}
            </div>
          </div>

          {listError && <div className="admin-error">{listError}</div>}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>First name</th>
                  <th>Email</th>
                  <th>Email status</th>
                  <th>Language</th>
                  <th>Stage</th>
                  <th>Score</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {!listLoading && list.rows?.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="admin-empty">No submissions match this search.</div>
                    </td>
                  </tr>
                )}
                {list.rows?.map((row) => (
                  <tr key={row.submission_id}>
                    <td data-label="Date" className="admin-col-muted">{formatDate(row.created_at)}</td>
                    <td data-label="First name" className="admin-col-em">{row.first_name || "—"}</td>
                    <td data-label="Email" className="admin-col-muted">{row.email || "—"}</td>
                    <td data-label="Email status">
                      {row.email_status ? (
                        <span className="admin-email-status">
                          <span className={`admin-email-badge admin-email-badge--${row.email_status.replace("email.", "")}`}>
                            {row.email_status.replace("email.", "").replace(/^\w/, (c) => c.toUpperCase())}
                          </span>
                          {row.email_status_at && (
                            <span className="admin-email-status-date">{formatDate(row.email_status_at)}</span>
                          )}
                        </span>
                      ) : "—"}
                    </td>
                    <td data-label="Language" className="admin-col-muted">{row.language || "—"}</td>
                    <td data-label="Stage">{row.stage || "—"}</td>
                    <td data-label="Score" className="admin-col-muted">
                      {row.score != null && row.score !== "" ? row.score : "—"}
                    </td>
                    <td data-label="Report">
                      <Link to={`/dashboard?submissionId=${row.submission_id}&language=${(row.language || "SR").toLowerCase()}`} target="_blank" rel="noreferrer">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <div className="admin-pagination-meta">
              Page {page} of {pages}
            </div>
            <div className="admin-pagination-actions">
              <button
                type="button"
                className="admin-ghost-button"
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0 || listLoading}
              >
                Previous
              </button>
              <button
                type="button"
                className="admin-ghost-button"
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={listLoading || offset + PAGE_SIZE >= total}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
