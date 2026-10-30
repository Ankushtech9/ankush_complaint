import { useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Toast from "../components/Toast.jsx";
import { initials } from "../utils/format.js";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form,setForm]=useState({name:user.name,phone:user.phone||"",address:user.address||"",currentPassword:"",newPassword:""});
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const save=async e=>{e.preventDefault();try{const res=await api.put("/auth/profile",form);updateUser(res.data.user);setMessage("Profile updated successfully");setForm(x=>({...x,currentPassword:"",newPassword:""}))}catch(x){setError(x.response?.data?.message||"Update failed")}};
  return <><div className="page-head"><div><span className="eyebrow">Account</span><h1>Your profile</h1><p>Keep your contact details current.</p></div></div><div className="profile-grid"><section className="panel profile-card"><div className="big-avatar">{initials(user.name)}</div><h2>{user.name}</h2><p>{user.email}</p><span className="role-pill">{user.role.label}</span>{user.department&&<small>{user.department.name}</small>}</section><form className="panel form" onSubmit={save}><h2>Personal details</h2><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Address<textarea value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label><hr/><h2>Change password</h2><label>Current password<input type="password" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/></label><label>New password<input type="password" minLength="8" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/></label><button className="btn primary">Save changes</button></form></div><Toast message={message} type="success" onClose={()=>setMessage("")}/><Toast message={error} type="error" onClose={()=>setError("")}/></>;
}
