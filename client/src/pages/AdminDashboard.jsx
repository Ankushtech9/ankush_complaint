import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import StatCard from "../components/StatCard.jsx";
import ComplaintCard from "../components/ComplaintCard.jsx";
import Loader from "../components/Loader.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  useEffect(() => { Promise.all([api.get("/dashboard/stats"),api.get("/complaints?limit=5")]).then(([s,c]) => { setStats(s.data); setRecent(c.data.items); }); }, []);
  if (!stats) return <Loader full />;
  return <><div className="page-head"><div><span className="eyebrow">Administration</span><h1>Operations overview</h1><p>Monitor complaints, people and departments from one place.</p></div><Link className="btn ghost" to="/admin/activity">View activity</Link></div><div className="stats-grid six"><StatCard label="All complaints" value={stats.total} icon="◫"/><StatCard label="Pending" value={stats.pending} icon="◌"/><StatCard label="In review" value={stats.review} icon="◐"/><StatCard label="In progress" value={stats.progress} icon="↗"/><StatCard label="Resolved" value={stats.resolved} icon="✓"/><StatCard label="Users" value={stats.users} icon="◎"/></div><div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><h2>Complaint mix</h2><p>Top categories by volume</p></div></div>{stats.byCategory.map((x,i) => <div className="bar-row" key={i}><span>{x.name}</span><div><i style={{width:`${Math.min(100, x.count / Math.max(1, stats.total) * 100)}%`}}></i></div><b>{x.count}</b></div>)}</section><section className="panel"><div className="panel-head"><div><h2>Department load</h2><p>Where requests are going</p></div></div>{stats.byDepartment.map((x,i) => <div className="bar-row" key={i}><span>{x.name}</span><div><i style={{width:`${Math.min(100, x.count / Math.max(1, stats.total) * 100)}%`}}></i></div><b>{x.count}</b></div>)}</section></div><div className="section-head"><div><h2>Latest complaints</h2><p>Most recently submitted requests</p></div><Link to="/admin/complaints" className="text-link">Manage all →</Link></div><div className="cards-grid">{recent.map(x => <ComplaintCard key={x._id} complaint={x}/>)}</div></>;
}
