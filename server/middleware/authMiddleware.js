import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return res.status(401).json({ message: "Authentication required" });
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("role department");
    if (!user || !user.isActive) return res.status(401).json({ message: "Account is unavailable" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function roles(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role?.name;
    if (!allowed.includes(role)) return res.status(403).json({ message: "Access denied" });
    next();
  };
}
