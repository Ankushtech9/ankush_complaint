export function dateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase() || "U";
}

export function statusClass(status = "") {
  return status.toLowerCase().replaceAll(" ", "-");
}

export function moneylessNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}
