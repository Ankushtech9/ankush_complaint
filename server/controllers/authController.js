import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import { logActivity } from "../services/logService.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
  if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters" });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email is already registered" });
  const role = await Role.findOne({ name: "citizen" });
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: email.toLowerCase(), password: hash, phone: phone || "", address: address || "", role: role._id });
  await logActivity({ actor: user._id, action: "Created citizen account", entity: "User", entityId: user._id.toString() });
  const populated = await User.findById(user._id).populate("role department");
  res.status(201).json({ token: generateToken(user), user: sanitize(populated) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).populate("role department");
  if (!user || !user.isActive || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
  user.lastLogin = new Date();
  await user.save();
  await logActivity({ actor: user._id, action: "Logged in", entity: "User", entityId: user._id.toString() });
  res.json({ token: generateToken(user), user: sanitize(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitize(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, address, currentPassword, newPassword } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (newPassword) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) return res.status(400).json({ message: "Current password is incorrect" });
    if (newPassword.length < 8) return res.status(400).json({ message: "New password must contain at least 8 characters" });
    user.password = await bcrypt.hash(newPassword, 12);
  }
  await user.save();
  const populated = await User.findById(user._id).populate("role department");
  res.json({ user: sanitize(populated), message: "Profile updated" });
});

function sanitize(user) {
  const obj = user.toObject();
  delete obj.password;
  return obj;
}
