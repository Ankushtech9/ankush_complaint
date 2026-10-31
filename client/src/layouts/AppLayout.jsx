import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";
import { initials } from "../utils/format.js";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const refreshUnread = useCallback(async () => {
    try {
      const response = await api.get("/notifications");
      const items = Array.isArray(response.data?.items) ? response.data.items : [];
      setUnread(items.filter((item) => !item.read).length);
    } catch {
      // Keep the shell usable if notifications are temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
    const handleUpdate = () => { void refreshUnread(); };
    window.addEventListener("janconnect:notifications-updated", handleUpdate);
    return () => window.removeEventListener("janconnect:notifications-updated", handleUpdate);
  }, [location.pathname, refreshUnread]);

  const links = user.role.name === "admin"
    ? [["/admin", "Overview"], ["/admin/complaints", "Complaints"], ["/admin/users", "Users"], ["/admin/departments", "Departments"], ["/admin/categories", "Categories"], ["/admin/activity", "Activity"]]
    : user.role.name === "official"
      ? [["/official", "Overview"], ["/official/complaints", "My Assignments"]]
      : [["/dashboard", "Overview"], ["/complaints", "My Complaints"], ["/complaints/new", "New Complaint"]];

  return <div className="app-shell">
    <aside className={open ? "sidebar open" : "sidebar"}>
      <div className="brand"><div className="brand-mark">J</div><div><strong>JanConnect</strong><small>Citizen services</small></div></div>
      <nav>{links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "active" : ""}><span>{label.slice(0,1)}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom">
        <NavLink to="/notifications" onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "active" : ""}><span>N</span>Notifications{unread > 0 && <b>{unread > 99 ? "99+" : unread}</b>}</NavLink>
        <NavLink to="/profile" onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "active" : ""}><span>P</span>Profile</NavLink>
      </div>
    </aside>
    <main className="main">
      <header className="topbar">
        <button className="mobile-menu" aria-label="Open navigation menu" onClick={() => setOpen(!open)}>☰</button>
        <div className="crumb">{location.pathname === "/" ? "Home" : location.pathname.split("/").filter(Boolean).join(" / ")}</div>
        <div className="top-actions">
          <button type="button" className="notification-btn" aria-label={`Open notifications${unread ? `, ${unread} unread` : ""}`} title="Notifications" onClick={() => navigate("/notifications")}>
            <span aria-hidden="true">♧</span>{unread > 0 && <i>{unread > 99 ? "99+" : unread}</i>}
          </button>
          <button className="user-menu" onClick={() => navigate("/profile")} aria-label="Open profile"><span className="avatar">{initials(user.name)}</span><span className="user-name">{user.name}</span></button>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </header>
      <section className="content"><Outlet /></section>
    </main>
  </div>;
}
