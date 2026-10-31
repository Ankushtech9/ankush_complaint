import User from "../models/User.js";
import Role from "../models/Role.js";
import Department from "../models/Department.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const { search, role, department } = req.query;
  const query = {};
  if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  if (department) query.department = department;
  const items = await User.find(query).populate("role department", "name label code").select("-password").sort({ createdAt: -1 });
  res.json({ items });
});

export const update = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (req.body.role) {
    const role = await Role.findOne({ name: req.body.role });
    if (!role) return res.status(400).json({ message: "Invalid role" });
    user.role = role._id;
  }
  if (req.body.department !== undefined) {
    const department = req.body.department ? await Department.findById(req.body.department) : null;
    if (req.body.department && !department) return res.status(400).json({ message: "Department not found" });
    user.department = department?._id || null;
  }
  if (req.body.isActive !== undefined) user.isActive = Boolean(req.body.isActive);
  if (req.body.name) user.name = req.body.name;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.newPassword) user.password = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();
  res.json({ user: await User.findById(user._id).populate("role department", "name label code").select("-password") });
});
