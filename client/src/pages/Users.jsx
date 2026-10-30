import { useEffect, useState } from "react";
import api from "../services/api.js";
import Loader from "../components/Loader.jsx";
import Toast from "../components/Toast.jsx";

export default function Users() {
  const [items,setItems]=useState([]);
  const [departments,setDepartments]=useState([]);
  const [search,setSearch]=useState("");
  const [error,setError]=useState("");
  const load=()=>api.get(`/users?search=${encodeURIComponent(search)}`).then(r=>setItems(r.data.items));
  useEffect(()=>{ Promise.all([load(),api.get("/departments")]).then(([,d])=>setDepartments(d.data.items)); },[]);
  const update=async(id,data)=>{try{await api.patch(`/users/${id}`,data);await load()}catch(e){setError(e.response?.data?.message||"Update failed")}};
  return <><div className="page-head"><div><span className="eyebrow">Administration</span><h1>User management</h1><p>Manage roles, departments and account access.</p></div></div><div className="filter-bar"><input placeholder="Search name or email..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()}/><button className="btn primary" onClick={load}>Search</button></div><div className="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map(u=><tr key={u._id}><td><strong>{u.name}</strong><small>{u.email}</small></td><td><select value={u.role.name} onChange={e=>update(u._id,{role:e.target.value})}>{["citizen","official","admin"].map(r=><option key={r}>{r}</option>)}</select></td><td><select value={u.department?._id||""} onChange={e=>update(u._id,{department:e.target.value})}><option value="">None</option>{departments.map(d=><option value={d._id} key={d._id}>{d.name}</option>)}</select></td><td><span className={u.isActive?"active-dot":"inactive-dot"}>{u.isActive?"Active":"Disabled"}</span></td><td><button className="btn small ghost" onClick={()=>update(u._id,{isActive:!u.isActive})}>{u.isActive?"Disable":"Enable"}</button></td></tr>)}</tbody></table>{!items.length&&<Loader/>}</div><Toast message={error} type="error" onClose={()=>setError("")}/></>;
}
