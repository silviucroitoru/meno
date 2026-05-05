import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminSignOut, fetchAdminMetrics, fetchAdminSubmissions } from "../data/adminApi";
import "./admin.css";

const PAGE_SIZE = 50;

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
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
    <div className="admin-card admin-col-6">
      <h3 className="admin-section-title">{title}</h3>
      {entries.length === 0 ? (
        <div className="admin-muted">No data yet</div>
      ) : (
        entries.map(([key, count]) => {
          const raw = Number(count) || 0;
          const shareRaw = total > 0 ? (raw / total) * 100 : 0;
          const width = Math.max(0, Math.min(100, shareRaw));
          return (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                <span>{key}</span>
                <span className="admin-muted">{raw}</span>
              </div>
              <div style={{ height: 8, background: "#F2F4F7", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${width}%`, height: "100%", background: "var(--main-blue)" }} />
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
        <div>
          <button type="button" className="admin-ghost-button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="admin-container">
        <section className="admin-grid" style={{ marginBottom: 18 }}>
          <div className="admin-card admin-col-4">
            <div className="admin-metric-label">Total submissions</div>
            <div className="admin-metric-value">{metrics?.submissionCount ?? 0}</div>
          </div>
          <div className="admin-card admin-col-4">
            <div className="admin-metric-label">Submissions with PDF</div>
            <div className="admin-metric-value">{metrics?.pdfCount ?? 0}</div>
          </div>
          <div className="admin-card admin-col-4">
            <div className="admin-metric-label">Reports generated</div>
            <div className="admin-metric-value">{metrics?.reportCount ?? 0}</div>
          </div>
          <Bars title="By menopause stage" data={metrics?.byStage} />
        </section>

        <section className="admin-card">
          <h2 className="admin-section-title">Submissions</h2>
          <div className="admin-toolbar">
            <input
              type="search"
              placeholder="Search name, email, stage…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search submissions"
            />
            <div className="admin-muted">
              {listLoading
                ? "Loading…"
                : total === 0
                  ? "No results"
                  : `Showing ${showingFrom}–${showingTo} of ${total}`}
            </div>
          </div>

          {metricsError && !metricsLoading && <div className="admin-error">{metricsError}</div>}
          {listError && <div className="admin-error">{listError}</div>}

          <div className="admin-table-wrap" style={{ marginTop: 12 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Submission ID</th>
                  <th>First name</th>
                  <th>Email</th>
                  <th>Language</th>
                  <th>Stage</th>
                  <th>PDF</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {!listLoading && list.rows?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="admin-muted">
                      No submissions match this search.
                    </td>
                  </tr>
                )}
                {list.rows?.map((row) => (
                  <tr key={row.submission_id}>
                    <td className="admin-muted">{formatDate(row.created_at)}</td>
                    <td><span className="admin-pill">{row.submission_id}</span></td>
                    <td>{row.first_name || "—"}</td>
                    <td className="admin-muted">{row.email || "—"}</td>
                    <td className="admin-muted">{row.language || "—"}</td>
                    <td>{row.stage || "—"}</td>
                    <td className="admin-muted">{row.pdf_url ? "Yes" : "No"}</td>
                    <td>
                      <Link to={`/dashboard?submissionId=${row.submission_id}&language=${(row.language || "SR").toLowerCase()}`} target="_blank" rel="noreferrer">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-toolbar" style={{ marginTop: 14 }}>
            <div className="admin-muted">
              Page {page} of {pages}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
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

