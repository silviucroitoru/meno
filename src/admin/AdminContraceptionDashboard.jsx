import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  adminSignOut,
  fetchAdminContraceptionDailySubmissions,
  fetchAdminContraceptionMarketingRange,
  fetchAdminContraceptionMetrics,
  fetchAdminContraceptionSubmissions,
  fetchAdminMarketingAccess,
} from "../data/adminApi";
import { TIMEFRAMES, computeRange, formatChartDay } from "./adminDateRange";
import AdminDashboardSwitcher from "./AdminDashboardSwitcher.jsx";
import AdminHeaderBurger from "./AdminHeaderBurger.jsx";
import "./admin.css";

const PAGE_SIZE = 50;

const CHART_BLUE = "#0E2E57";
const CHART_AXIS = "rgba(14, 46, 87, 0.45)";
const CHART_GRID = "rgba(14, 46, 87, 0.06)";

function AdminActivityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const count = Number(payload[0]?.value ?? 0);
  return (
    <div className="admin-chart-tooltip">
      <div className="admin-chart-tooltip__label">{label}</div>
      <div className="admin-chart-tooltip__value">
        {count} {count === 1 ? "submission" : "submissions"}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-GB", {
      timeZone: "Europe/Belgrade",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return String(value);
  }
}

export default function AdminContraceptionDashboard() {
  const navigate = useNavigate();

  const [canMarketing, setCanMarketing] = useState(false);
  const [marketingData, setMarketingData] = useState(null);

  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const [timeframe, setTimeframe] = useState("last7");
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const [list, setList] = useState({ total: 0, rows: [], offset: 0, limit: PAGE_SIZE });
  const [listError, setListError] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const searchTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setChartLoading(true);
    setChartError(null);
    const range = computeRange(timeframe);
    fetchAdminContraceptionDailySubmissions(range)
      .then((data) => {
        if (!cancelled) setChartData(data.map((d) => ({ ...d, label: formatChartDay(d.day) })));
      })
      .catch((err) => {
        if (!cancelled) setChartError(err?.message || "Failed to load chart data");
      })
      .finally(() => {
        if (!cancelled) setChartLoading(false);
      });
    return () => { cancelled = true; };
  }, [timeframe]);

  useEffect(() => {
    fetchAdminMarketingAccess()
      .then((res) => {
        const allowed = res?.allowed === true;
        setCanMarketing(allowed);
        if (allowed) {
          const from = "2026-05-13";
          const yesterday = computeRange("yesterday").to;
          fetchAdminContraceptionMarketingRange({ from, to: yesterday })
            .then(setMarketingData)
            .catch(() => {});
        }
      })
      .catch(() => setCanMarketing(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setMetricsLoading(true);
    setMetricsError(null);
    fetchAdminContraceptionMetrics()
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
    fetchAdminContraceptionSubmissions({ search: debouncedSearch, limit: PAGE_SIZE, offset })
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
          <AdminDashboardSwitcher current="contraception" />
          {canMarketing && (
            <Link to="/admin/contraception/marketing-costs" className="admin-ghost-button">
              Marketing Costs
            </Link>
          )}
          <button type="button" className="admin-ghost-button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
        <AdminHeaderBurger>
          <AdminDashboardSwitcher current="contraception" />
          {canMarketing && (
            <Link to="/admin/contraception/marketing-costs" className="admin-ghost-button">
              Marketing Costs
            </Link>
          )}
          <button type="button" className="admin-ghost-button" onClick={handleSignOut}>
            Sign out
          </button>
        </AdminHeaderBurger>
      </header>

      <main className="admin-container">
        <section className="admin-section" aria-labelledby="admin-chart-heading">
          <div className="admin-section-prehead">Contraception · Activity</div>
          <h2 id="admin-chart-heading" className="admin-section-title">Submissions per day</h2>

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

          <div className="admin-chart-wrap">
            {chartLoading && <div className="admin-loading">Loading chart…</div>}
            {chartError && !chartLoading && <div className="admin-error">{chartError}</div>}
            {!chartLoading && !chartError && (
              <div className="admin-chart-inner">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -8, bottom: 4 }}>
                    <defs>
                      <linearGradient id="adminContraActivityFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_BLUE} stopOpacity={0.2} />
                        <stop offset="55%" stopColor={CHART_BLUE} stopOpacity={0.06} />
                        <stop offset="100%" stopColor={CHART_BLUE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={CHART_GRID} vertical={false} strokeDasharray="4 10" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: CHART_AXIS, fontSize: 12 }}
                      dy={6}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={36}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: CHART_AXIS, fontSize: 12 }}
                      domain={[0, "auto"]}
                    />
                    <Tooltip content={<AdminActivityTooltip />} cursor={{ stroke: `${CHART_BLUE}33`, strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Submissions"
                      stroke={CHART_BLUE}
                      strokeWidth={2.5}
                      fill="url(#adminContraActivityFill)"
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: CHART_BLUE }}
                      dot={
                        chartData.length <= 3
                          ? { r: 4, strokeWidth: 2, stroke: "#fff", fill: CHART_BLUE }
                          : { r: 0 }
                      }
                      animationDuration={600}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className="admin-section" aria-labelledby="admin-metrics-heading">
          <div className="admin-section-prehead">Contraception · Overview</div>
          <h2 id="admin-metrics-heading" className="admin-section-title">Metrics</h2>

          {metricsLoading && <div className="admin-loading">Loading metrics…</div>}
          {metricsError && !metricsLoading && <div className="admin-error">{metricsError}</div>}

          {metrics && !metricsLoading && !metricsError && (
            <div className="admin-metrics-row">
              <div className="admin-metric-card admin-metric-card--compact">
                <div className="admin-metric-label">Completed submissions</div>
                <div className="admin-metric-value">{metrics.completedSubmissions ?? 0}</div>
              </div>
              <div className="admin-metric-card admin-metric-card--compact">
                <div className="admin-metric-label">Questionnaire completion rate</div>
                <div className="admin-metric-value">
                  {Number(metrics.completionRatePct ?? 0).toFixed(1)}%
                </div>
              </div>
              {canMarketing && marketingData && (
                <div className="admin-metric-card admin-metric-card--compact">
                  <div className="admin-metric-label">Total ad spend (USD)</div>
                  <div className="admin-metric-value">
                    ${Number(marketingData.total_spend_usd ?? 0).toFixed(2)}
                  </div>
                  <div className="admin-metric-hint">Since May 13</div>
                </div>
              )}
              {canMarketing && marketingData && (
                <div className="admin-metric-card admin-metric-card--compact">
                  <div className="admin-metric-label">Cost per submission (USD)</div>
                  <div className="admin-metric-value">
                    {marketingData.avg_cpa_usd != null
                      ? `$${Number(marketingData.avg_cpa_usd).toFixed(2)}`
                      : "—"}
                  </div>
                  <div className="admin-metric-hint">Since May 13</div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="admin-section" aria-labelledby="admin-submissions-heading">
          <div className="admin-section-prehead">Contraception · Submissions</div>
          <h2 id="admin-submissions-heading" className="admin-section-title">All submissions</h2>

          <div className="admin-toolbar">
            <div className="admin-search">
              <input
                type="search"
                placeholder="Search name, email…"
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
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {!listLoading && list.rows?.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div className="admin-empty">No submissions match this search.</div>
                    </td>
                  </tr>
                )}
                {list.rows?.map((row) => (
                  <tr key={row.submission_id}>
                    <td data-label="Date" className="admin-col-muted">{formatDate(row.created_at)}</td>
                    <td data-label="First name" className="admin-col-em">{row.first_name || "—"}</td>
                    <td data-label="Email" className="admin-col-muted">{row.email || "—"}</td>
                    <td data-label="Report">
                      <Link
                        to={`/contraception/results?submissionId=${row.submission_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
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
