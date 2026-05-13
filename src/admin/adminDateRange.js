export const TIMEFRAMES = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
];

export function computeRange(key) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = parts.split("-").map(Number);
  const fmt = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  const today = new Date(y, m - 1, d);

  switch (key) {
    case "today":
      return { from: fmt(today), to: fmt(today) };
    case "yesterday": {
      const yy = new Date(today);
      yy.setDate(yy.getDate() - 1);
      return { from: fmt(yy), to: fmt(yy) };
    }
    case "last7": {
      const s = new Date(today);
      s.setDate(s.getDate() - 6);
      return { from: fmt(s), to: fmt(today) };
    }
    case "last30": {
      const s = new Date(today);
      s.setDate(s.getDate() - 29);
      return { from: fmt(s), to: fmt(today) };
    }
    case "thisMonth":
      return {
        from: fmt(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: fmt(today),
      };
    case "lastMonth": {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: fmt(first), to: fmt(last) };
    }
    default:
      return { from: fmt(today), to: fmt(today) };
  }
}

export function formatChartDay(dayStr) {
  const dd = new Date(dayStr);
  if (isNaN(dd.getTime())) return dayStr;
  return dd.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
