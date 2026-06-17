import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const OPTIONS = [
  { key: "menopause", label: "Menopause", path: "/admin" },
  { key: "contraception", label: "Contraception", path: "/admin/contraception" },
];

export default function AdminDashboardSwitcher({ current }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentLabel = OPTIONS.find((o) => o.key === current)?.label ?? "Dashboard";

  return (
    <div className="admin-switcher" ref={ref}>
      <button
        type="button"
        className="admin-ghost-button admin-switcher-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {currentLabel}
        <span className="admin-switcher-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="admin-switcher-menu" role="listbox">
          {OPTIONS.map((o) => (
            <li key={o.key} role="option" aria-selected={o.key === current}>
              <button
                type="button"
                className={`admin-switcher-item${o.key === current ? " admin-switcher-item--active" : ""}`}
                onClick={() => {
                  setOpen(false);
                  if (o.key !== current) navigate(o.path);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
