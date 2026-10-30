import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import StatCard from "../components/StatCard.jsx";
import ComplaintCard from "../components/ComplaintCard.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function OfficialDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  useEffect(() => { Promise.all([api.get("/dashboard/stats"),api.get("/complaints?limit=4")]).then(([s,c]) => { setStats(s.data); setItems(c.data.items); }); }, []);
  if (!stats) return <Loader full />;
  return <><div className="page-head"><div><span className="eyebrow">{user.department?.name || "Operations"}</span><h1>Good morning, {user.name.split(" ")[0]}.</h1><p>Here are the complaints currently assigned to you.</p></div><Link className="btn primary" to="/official/complaints">Open assignments</Link></div><div className="stats-grid"><StatCard label="Assigned" value={stats.total} icon="◎"/><StatCard label="Pending" value={stats.pending} icon="◌"/><StatCard label="In review" value={stats.review} icon="◐"/><StatCard label="Resolved" value={stats.resolved} icon="✓"/></div><div className="section-head"><div><h2>Recent assignments</h2><p>Work from the latest requests first.</p></div></div><div className="cards-grid">{items.map(x => <ComplaintCard key={x._id} complaint={x}/>)}</div></>;
}
