import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ComplaintList from "./pages/ComplaintList.jsx";
import ComplaintForm from "./pages/ComplaintForm.jsx";
import ComplaintDetail from "./pages/ComplaintDetail.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import OfficialDashboard from "./pages/OfficialDashboard.jsx";
import Users from "./pages/Users.jsx";
import Departments from "./pages/Departments.jsx";
import Categories from "./pages/Categories.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/Profile.jsx";
import Activity from "./pages/Activity.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { homeForRole } from "./utils/guards.js";

export default function App() {
  const { user } = useAuth();
  return <Routes>
    <Route path="/" element={user ? <Navigate to={homeForRole(user.role.name)} replace/> : <Landing/>}/>
    <Route path="/login" element={user ? <Navigate to={homeForRole(user.role.name)} replace/> : <Login/>}/>
    <Route path="/register" element={user ? <Navigate to={homeForRole(user.role.name)} replace/> : <Register/>}/>
    <Route element={<ProtectedRoute roles={["citizen"]}/>}>
      <Route element={<AppLayout/>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/complaints" element={<ComplaintList/>}/>
        <Route path="/complaints/new" element={<ComplaintForm/>}/>
        <Route path="/notifications" element={<Notifications/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Route>
    </Route>
    <Route element={<ProtectedRoute roles={["official"]}/>}>
      <Route element={<AppLayout/>}>
        <Route path="/official" element={<OfficialDashboard/>}/>
        <Route path="/official/complaints" element={<ComplaintList official/>}/>
        <Route path="/notifications" element={<Notifications/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Route>
    </Route>
    <Route element={<ProtectedRoute roles={["admin"]}/>}>
      <Route element={<AppLayout/>}>
        <Route path="/admin" element={<AdminDashboard/>}/>
        <Route path="/admin/complaints" element={<ComplaintList admin/>}/>
        <Route path="/admin/users" element={<Users/>}/>
        <Route path="/admin/departments" element={<Departments/>}/>
        <Route path="/admin/categories" element={<Categories/>}/>
        <Route path="/admin/activity" element={<Activity/>}/>
        <Route path="/notifications" element={<Notifications/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Route>
    </Route>
    <Route element={<ProtectedRoute roles={["citizen","official","admin"]}/>}>
      <Route element={<AppLayout/>}>
        <Route path="/complaints/:id" element={<ComplaintDetail/>}/>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
