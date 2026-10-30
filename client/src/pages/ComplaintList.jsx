import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import ComplaintCard from "../components/ComplaintCard.jsx";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ComplaintList({ official = false, admin = false }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  useEffect(() => { Promise.all([api.get("/categories"), api.get("/departments")]).then(([c,d]) => { setCategories(c.data.items.filter(x => x.isActive)); setDepartments(d.data.items.filter(x => x.isActive)); }); }, []);
  useEffect(() => { setLoading(true); const q = new URLSearchParams(Object.entries(filters).filter(([,v]) => v)); api.get(`/complaints?${q}`).then(res => setItems(res.data.items)).finally(() => setLoading(false)); }, [filters]);
  return <><div className="page-head"><div><span className="eyebrow">{admin ? "Administration" : official ? "Operations" : "Citizen portal"}</span><h1>{admin ? "All complaints" : official ? "My assignments" : "My complaints"}</h1><p>Search, filter and open a complaint to view its full history.</p></div>{!official && !admin && <Link className="btn primary" to="/complaints/new">+ New complaint</Link>}</div><div className="filter-bar"><input placeholder="Search complaint number or title..." value={filters.search} onChange={e => setFilters({...filters,search:e.target.value})}/><select value={filters.status} onChange={e => setFilters({...filters,status:e.target.value})}><option value="">All statuses</option>{["Pending","In Review","In Progress","Resolved","Withdrawn"].map(x => <option key={x}>{x}</option>)}</select>{admin && <><select value={filters.category || ""} onChange={e => setFilters({...filters,category:e.target.value})}><option value="">All categories</option>{categories.map(x => <option value={x._id} key={x._id}>{x.name}</option>)}</select><select value={filters.department || ""} onChange={e => setFilters({...filters,department:e.target.value})}><option value="">All departments</option>{departments.map(x => <option value={x._id} key={x._id}>{x.name}</option>)}</select></>}</div>{loading ? <Loader full/> : items.length ? <div className="cards-grid">{items.map(x => <ComplaintCard key={x._id} complaint={x}/>)}</div> : <EmptyState title="No complaints found" text="Try changing the filters or create a new complaint."/>}<div className="role-chip">{user.role.label}</div></>;
}
