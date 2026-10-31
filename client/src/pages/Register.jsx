import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { homeForRole } from "../utils/guards.js";
import Toast from "../components/Toast.jsx";
import { AuthPage } from "./Login.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", password: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault();
    try {
      const data = await register(form);
      navigate(homeForRole(data.user.role.name));
    } catch (err) { setError(err.response?.data?.message || "Unable to create account"); }
  };
  return <AuthPage title="Create your account" subtitle="Join the civic network in less than a minute."><form className="form grid-form" onSubmit={submit}><label>Full name<input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required/></label><label>Phone<input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}/></label><label className="span-2">Email<input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required/></label><label className="span-2">Address<input value={form.address} onChange={e => setForm({...form,address:e.target.value})}/></label><label className="span-2">Password<input type="password" minLength="8" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required/></label><button className="btn primary full-btn span-2">Create account</button><p className="form-note span-2">Already registered? <Link to="/login">Sign in</Link></p></form><Toast message={error} type="error" onClose={() => setError("")}/></AuthPage>;
}
