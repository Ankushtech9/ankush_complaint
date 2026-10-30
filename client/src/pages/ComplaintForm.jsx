import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Toast from "../components/Toast.jsx";

const emptyForm = { title: "", description: "", category: "", department: "", priority: "Medium", address: "", city: "" };

export default function ComplaintForm() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [assistantText, setAssistantText] = useState("");
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", text: "Namaste! 🙏 Main aapki complaint bharne mein madad karunga. Bas apni bhasha mein batayein ki kya dikkat hai aur kahan hai. Jaise: ‘Hamare gaon mein handpump 10 din se kharab hai.’ Main form ka draft banaunga—submit karne se pehle aap use check kar sakte hain." }]);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    Promise.all([api.get("/categories"), api.get("/departments")]).then(([c, d]) => {
      setCategories(c.data.items.filter(x => x.isActive));
      setDepartments(d.data.items.filter(x => x.isActive));
    }).catch(() => setError("Categories could not be loaded. Please refresh the page."));
  }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, assistantBusy]);
  useEffect(() => () => recognitionRef.current?.stop(), []);

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const applySuggestedFields = (fields = {}) => {
    setForm(current => {
      const next = { ...current };
      ["title", "description", "priority", "address", "city"].forEach(key => {
        if (typeof fields[key] === "string" && fields[key].trim()) next[key] = fields[key];
      });
      if (fields.category) {
        const match = categories.find(x => x.name.toLowerCase() === fields.category.toLowerCase());
        if (match) next.category = match._id;
      }
      if (fields.department) {
        const match = departments.find(x => x.name.toLowerCase() === fields.department.toLowerCase());
        if (match) next.department = match._id;
      }
      return next;
    });
  };

  const sendToAssistant = async (textOverride) => {
    const message = (textOverride ?? assistantText).trim();
    if (!message || assistantBusy) return;
    const nextMessages = [...messages, { role: "user", text: message }];
    setMessages(nextMessages);
    setAssistantText("");
    setAssistantBusy(true);
    try {
      const response = await api.post("/ai/complaint-assistant", {
        message,
        history: messages.slice(-8),
        currentForm: {
          ...form,
          category: categories.find(x => x._id === form.category)?.name || "",
          department: departments.find(x => x._id === form.department)?.name || ""
        },
        categories: categories.map(({ name }) => ({ name })),
        departments: departments.map(({ name }) => ({ name }))
      });
      applySuggestedFields(response.data.fields);
      setMessages(current => [...current, { role: "assistant", text: response.data.reply || "Draft updated. Please check the form." }]);
    } catch (err) {
      const msg = err.response?.data?.message || "Assistant abhi jawab nahi de pa raha. Thodi der baad dobara koshish karein.";
      setMessages(current => [...current, { role: "assistant", text: msg }]);
    } finally { setAssistantBusy(false); }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Please use Chrome or type your message.");
      return;
    }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setAssistantText(transcript);
      setListening(false);
    };
    recognition.onerror = () => { setListening(false); setError("Voice input nahi ho paya. Dobara try karein ya type karein."); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (e.currentTarget.image.files[0]) data.append("image", e.currentTarget.image.files[0]);
      const res = await api.post("/complaints", data);
      navigate(`/complaints/${res.data.complaint._id}`);
    } catch (err) { setError(err.response?.data?.message || "Could not submit complaint"); } finally { setSaving(false); }
  };

  return <>
    <div className="page-head"><div><span className="eyebrow">New request</span><h1>Report a civic issue</h1><p>Apni dikkat batayein—AI assistant complaint form bharne mein madad karega.</p></div></div>

    <section className={`ai-helper card ${assistantOpen ? "is-open" : "is-collapsed"}`} aria-label="AI complaint assistant">
      <div className="ai-helper-head">
        <div className="ai-avatar" aria-hidden="true">✦</div>
        <div className="ai-helper-title"><span className="ai-kicker">GEMINI AI · JANCONNECT AI</span><h2>Complaint bharne mein madad chahiye?</h2><p>Hindi, Hinglish ya English mein bolkar ya likhkar batayein.</p></div>
        <button type="button" className="btn ghost ai-toggle" onClick={() => setAssistantOpen(v => !v)} aria-expanded={assistantOpen}>{assistantOpen ? "Hide −" : "Open +"}</button>
      </div>
      {assistantOpen && <>
        <div className="ai-chat" aria-live="polite">
          {messages.map((item, index) => <div className={`ai-message ${item.role === "user" ? "from-user" : "from-ai"}`} key={`${index}-${item.role}`}><span className="ai-message-label">{item.role === "user" ? "Aap" : "JanConnect AI"}</span><p>{item.text}</p></div>)}
          {assistantBusy && <div className="ai-message from-ai"><span className="ai-message-label">JanConnect AI</span><p className="ai-thinking"><i></i><i></i><i></i> Soch raha hoon…</p></div>}
          <div ref={chatEndRef} />
        </div>
        <div className="ai-input-row">
          <textarea aria-label="Describe your problem to the AI assistant" rows="2" value={assistantText} onChange={e => setAssistantText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendToAssistant(); } }} placeholder="Jaise: hamare mohalle ki naali band hai…" />
          <button type="button" className={`btn voice-btn ${listening ? "recording" : ""}`} onClick={startVoiceInput} title="Hindi mein bolkar batayein" aria-label={listening ? "Stop voice input" : "Speak your complaint"}>{listening ? "■" : "🎙️"}<span>{listening ? "Sun raha…" : "Bolein"}</span></button>
          <button type="button" className="btn primary ai-send" onClick={() => sendToAssistant()} disabled={assistantBusy || !assistantText.trim()} aria-label="Send message to assistant">{assistantBusy ? "…" : "➤"}</button>
        </div>
        <div className="ai-privacy-note">🔒 AI sirf form ka draft banata hai—complaint aapki permission ke bina submit nahi hogi. Aadhaar ya bank details share na karein.</div>
      </>}
    </section>

    <form className="form card-form" onSubmit={submit}>
      <div className="form-section"><div className="form-section-title"><div><h2>Complaint details</h2><p>AI se bhare gaye fields ko check karein aur zarurat ho to edit karein.</p></div><span className="draft-chip">✦ Editable draft</span></div><div className="grid-form">
        <label className="span-2">Title<input value={form.title} onChange={e => update("title", e.target.value)} required placeholder="Example: Street light not working near the market" /></label>
        <label>Category<select value={form.category} onChange={e => update("category", e.target.value)} required><option value="">Select category</option>{categories.map(x => <option key={x._id} value={x._id}>{x.icon} {x.name}</option>)}</select></label>
        <label>Priority<select value={form.priority} onChange={e => update("priority", e.target.value)}>{["Low", "Medium", "High", "Critical"].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Department<select value={form.department} onChange={e => update("department", e.target.value)}><option value="">Let admin decide</option>{departments.map(x => <option key={x._id} value={x._id}>{x.name}</option>)}</select></label>
        <label>City / Village<input value={form.city} onChange={e => update("city", e.target.value)} placeholder="Your city or village" /></label>
        <label className="span-2">Location / address<textarea rows="3" value={form.address} onChange={e => update("address", e.target.value)} required placeholder="Gaon, gali, landmark ya issue ki exact jagah" /></label>
        <label className="span-2">Description<textarea rows="6" value={form.description} onChange={e => update("description", e.target.value)} required placeholder="Kya dikkat hai, kab se hai, aur logon par kya asar pad raha hai?" /></label>
        <label className="span-2 upload-box">Supporting image<input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
      </div></div>
      <div className="form-actions"><button type="button" className="btn ghost" onClick={() => navigate(-1)}>Cancel</button><button className="btn primary" disabled={saving}>{saving ? "Submitting..." : "Submit complaint"}</button></div>
    </form>
    <Toast message={error} type="error" onClose={() => setError("")} />
  </>;
}
