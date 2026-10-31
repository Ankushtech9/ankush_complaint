export default function Toast({ message, type = "info", onClose }) {
  if (!message) return null;
  return <div className={`toast ${type}`} onClick={onClose}><strong>{type === "error" ? "!" : "✓"}</strong><span>{message}</span></div>;
}
