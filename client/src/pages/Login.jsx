import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { homeForRole } from "../utils/guards.js";
import Toast from "../components/Toast.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault();
    try {
      const data = await login(form.email, form.password);
      navigate(homeForRole(data.user.role.name));
    } catch (err) { setError(err.response?.data?.message || "Unable to sign in"); }
  };
  return <AuthPage title="Welcome back" subtitle="Sign in to manage your civic requests."><form className="form" onSubmit={submit}><label>Email<input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required placeholder="you@example.com"/></label><label>Password<input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required placeholder="••••••••"/></label><button className="btn primary full-btn">Sign in</button><p className="form-note">New here? <Link to="/register">Create a citizen account</Link></p></form><Toast message={error} type="error" onClose={() => setError("")}/></AuthPage>;
}

export function AuthPage({ title, subtitle, children }) {
  return <div className="auth-page"><div className="auth-visual"><Link className="brand light-brand" to="/"><div className="brand-mark">J</div><div><strong>JanConnect</strong><small>Citizen services</small></div></Link><div><span className="eyebrow">Built for better cities</span><h1>One place to report, follow and resolve.</h1><p>Keep civic communication simple, transparent and organized.</p></div></div><div className="auth-panel"><div className="auth-box"><Link className="back-link" to="/">← Back to home</Link><h2>{title}</h2><p>{subtitle}</p>{children}</div></div></div>;
}
