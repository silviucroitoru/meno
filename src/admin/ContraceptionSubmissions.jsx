import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAdminContraceptionSubmissions } from "../data/adminApi";

const PAGE_SIZE = 50;

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

export default function ContraceptionSubmissions() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const [list, setList] = useState({ total: 0, rows: [], offset: 0, limit: PAGE_SIZE });
  const [listError, setListError] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const searchTimer = useRef(null);

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

  const total = list.total || 0;
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingFrom = total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(total, offset + (list.rows?.length || 0));

  return (
    <section className="admin-section" aria-labelledby="admin-contraception-heading">
      <div className="admin-section-prehead">Contraception</div>
      <h2 id="admin-contraception-heading" className="admin-section-title">Contraception submissions</h2>

      <div className="admin-toolbar">
        <div className="admin-search">
          <input
            type="search"
            placeholder="Search name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search contraception submissions"
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
            </tr>
          </thead>
          <tbody>
            {!listLoading && list.rows?.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <div className="admin-empty">No submissions match this search.</div>
                </td>
              </tr>
            )}
            {list.rows?.map((row) => (
              <tr key={row.submission_id}>
                <td data-label="Date" className="admin-col-muted">{formatDate(row.created_at)}</td>
                <td data-label="First name" className="admin-col-em">{row.first_name || "—"}</td>
                <td data-label="Email" className="admin-col-muted">{row.email || "—"}</td>
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
  );
}
