export default function StatCard({ label, value, icon, tone = "" }) {
  return <div className={`stat-card ${tone}`}><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>;
}
