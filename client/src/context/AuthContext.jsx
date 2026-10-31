import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("civic_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/auth/me").then(res => setUser(res.data.user)).catch(() => localStorage.removeItem("civic_token")).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("civic_token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async data => {
    const res = await api.post("/auth/register", data);
    localStorage.setItem("civic_token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("civic_token");
    setUser(null);
  };

  const updateUser = next => setUser(next);

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
