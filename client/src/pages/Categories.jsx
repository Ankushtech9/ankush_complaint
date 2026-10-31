import { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";
import Modal from "../components/Modal.jsx";
import Toast from "../components/Toast.jsx";

const emptyForm = { name: "", icon: "•", description: "" };

export default function Categories() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/categories");
      setItems(Array.isArray(response.data?.items) ? response.data.items : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Categories load nahi ho paayi. Server aur admin login check karein.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/categories", { ...form, name: form.name.trim(), icon: form.icon.trim() || "•" });
      setOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Category create nahi ho paayi. Duplicate category name check karein.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Is category ko disable karna hai?")) return;
    try {
      await api.delete(`/categories/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Category disable nahi ho paayi.");
    }
  };

  return <>
    <div className="page-head"><div><span className="eyebrow">Administration</span><h1>Complaint categories</h1><p>Citizens ke liye complaint types ko simple aur clear rakhein.</p></div><button className="btn primary" onClick={() => { setError(""); setOpen(true); }}>+ Add category</button></div>
    {error && <div className="inline-error" role="alert"><span>{error}</span><button className="btn small ghost" onClick={load}>Retry</button></div>}
    {loading ? <div className="empty-state"><h3>Categories load ho rahi hain…</h3></div>
      : items.length === 0 ? <div className="empty-state"><h3>Abhi koi category nahi hai</h3><p>“Add category” se pehli complaint category banayein.</p></div>
      : <div className="cards-grid">{items.map((item) => <div className="panel management-card" key={item._id}>
        <div className="category-icon">{item.icon || "•"}</div><div className="management-copy"><h3>{item.name}</h3><p>{item.description || "No description provided."}</p><span className={item.isActive ? "status-active" : "status-disabled"}>{item.isActive ? "Active" : "Disabled"}</span></div>
        {item.isActive && <button type="button" className="icon-btn" aria-label={`Disable ${item.name}`} title="Disable category" onClick={() => remove(item._id)}>×</button>}
      </div>)}</div>}
    <Modal open={open} title="Add category" onClose={() => !saving && setOpen(false)}>
      <form className="form" onSubmit={save}>
        <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={80} /></label>
        <label>Icon<input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} maxLength={8} /></label>
        <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={300} /></label>
        <button className="btn primary full-btn" disabled={saving}>{saving ? "Creating…" : "Create category"}</button>
      </form>
    </Modal>
    <Toast message={error} type="error" onClose={() => setError("")} />
  </>;
}
