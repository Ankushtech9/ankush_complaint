import { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";
import { dateTime } from "../utils/format.js";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/notifications");
      setItems(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (err) {
      setError(err.response?.data?.message || "Notifications load nahi ho paayi. Server aur login status check karein.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const read = async (id) => {
    const item = items.find((x) => x._id === id);
    if (!item || item.read || busyId) return;
    setBusyId(id);
    setError("");
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((current) => current.map((x) => x._id === id ? { ...x, read: true } : x));
      window.dispatchEvent(new Event("janconnect:notifications-updated"));
    } catch (err) {
      setError(err.response?.data?.message || "Notification ko read mark nahi kar paaye.");
    } finally {
      setBusyId("");
    }
  };

  const all = async () => {
    if (markingAll || !items.some((x) => !x.read)) return;
    setMarkingAll(true);
    setError("");
    try {
      await api.patch("/notifications/read-all");
      setItems((current) => current.map((x) => ({ ...x, read: true })));
      window.dispatchEvent(new Event("janconnect:notifications-updated"));
    } catch (err) {
      setError(err.response?.data?.message || "Notifications update nahi ho paayi.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = items.filter((item) => !item.read).length;

  return <>
    <div className="page-head">
      <div><span className="eyebrow">JanConnect updates</span><h1>Notifications</h1><p>Apni complaints aur unke updates yahan dekhein.</p></div>
      <button className="btn ghost" onClick={all} disabled={markingAll || unreadCount === 0}>
        {markingAll ? "Updating…" : "Mark all read"}
      </button>
    </div>
    {error && <div className="inline-error" role="alert"><span>{error}</span><button className="btn small ghost" onClick={load}>Retry</button></div>}
    {loading ? <div className="empty-state"><div className="empty-state-icon">◌</div><h3>Notifications load ho rahi hain</h3><p>Thoda sa intezaar karein…</p></div>
      : items.length === 0 ? <div className="empty-state"><div className="empty-state-icon">♧</div><h3>Abhi koi notification nahi hai</h3><p>Complaint par naya update aayega to yahan dikhai dega.</p></div>
      : <div className="notification-list">{items.map((item) =>
        <button type="button" className={item.read ? "notification read" : "notification"} key={item._id}
          onClick={() => read(item._id)} disabled={busyId === item._id} aria-label={`${item.title}. ${item.read ? "Read" : "Mark as read"}`}>
          <div className={`notif-icon ${item.type || "info"}`}>{item.type === "success" ? "✓" : item.type === "warning" ? "!" : "i"}</div>
          <div className="notification-copy"><strong>{item.title}</strong><p>{item.message}</p><small>{dateTime(item.createdAt)}</small></div>
          {!item.read && <i className="unread-dot" aria-label="Unread" />}
        </button>
      )}</div>}
  </>;
}
