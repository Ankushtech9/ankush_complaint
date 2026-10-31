import { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";
import Modal from "../components/Modal.jsx";
import Toast from "../components/Toast.jsx";

const emptyForm = { name: "", code: "", description: "" };

export default function Departments() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/departments");
      setItems(Array.isArray(response.data?.items) ? response.data.items : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Departments load nahi ho paaye. Server aur admin login check karein.");
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
      await api.post("/departments", { ...form, name: form.name.trim(), code: form.code.trim().toUpperCase() });
      setOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Department create nahi ho paaya. Duplicate code/name check karein.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Is department ko disable karna hai?")) return;
    try {
      await api.delete(`/departments/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Department disable nahi ho paaya.");
    }
  };

  return <>
    <div className="page-head"><div><span className="eyebrow">Administration</span><h1>Departments</h1><p>JanConnect par civic complaints ko departments mein organize karein.</p></div><button className="btn primary" onClick={() => { setError(""); setOpen(true); }}>+ Add department</button></div>
    {error && <div className="inline-error" role="alert"><span>{error}</span><button className="btn small ghost" onClick={load}>Retry</button></div>}
    {loading ? <div className="empty-state"><h3>Departments load ho rahe hain…</h3></div>
      : items.length === 0 ? <div className="empty-state"><h3>Abhi koi department nahi hai</h3><p>“Add department” se pehla department banayein.</p></div>
      : <div className="cards-grid">{items.map((item) => <div className="panel management-card" key={item._id}>
        <div className="code-box">{item.code}</div><div className="management-copy"><h3>{item.name}</h3><p>{item.description || "No description provided."}</p><span className={item.isActive ? "status-active" : "status-disabled"}>{item.isActive ? "Active" : "Disabled"}</span></div>
        {item.isActive && <button type="button" className="icon-btn" aria-label={`Disable ${item.name}`} title="Disable department" onClick={() => remove(item._id)}>×</button>}
      </div>)}</div>}
    <Modal open={open} title="Add department" onClose={() => !saving && setOpen(false)}>
      <form className="form" onSubmit={save}>
        <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={80} /></label>
        <label>Code<input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} required maxLength={12} pattern="[A-Za-z0-9_-]+" title="Use letters, numbers, underscore or hyphen" /></label>
        <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={300} /></label>
        <button className="btn primary full-btn" disabled={saving}>{saving ? "Creating…" : "Create department"}</button>
      </form>
    </Modal>
    <Toast message={error} type="error" onClose={() => setError("")} />
  </>;
}
