import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import ComplaintCard from "../components/ComplaintCard.jsx";
import Loader from "../components/Loader.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    Promise.all([api.get("/dashboard/stats"), api.get("/complaints?limit=4")]).then(([s,c]) => { setStats(s.data); setRecent(c.data.items); });
  }, []);
  if (!stats) return <Loader full />;
  return <><div className="page-head"><div><span className="eyebrow">Citizen dashboard</span><h1>Hello, {user.name.split(" ")[0]}.</h1><p>Here’s what’s happening with your civic requests.</p></div><Link className="btn primary" to="/complaints/new">+ New complaint</Link></div><div className="stats-grid"><StatCard label="Total complaints" value={stats.total} icon="◫"/><StatCard label="Pending" value={stats.pending} icon="◌"/><StatCard label="In progress" value={stats.progress} icon="↗"/><StatCard label="Resolved" value={stats.resolved} icon="✓"/></div><div className="section-head"><div><h2>Recent complaints</h2><p>Your latest submissions</p></div><Link to="/complaints" className="text-link">View all →</Link></div><div className="cards-grid">{recent.length ? recent.map(x => <ComplaintCard key={x._id} complaint={x}/>) : <div className="wide"><p>No complaints yet. Create your first one.</p></div>}</div></>;
}
