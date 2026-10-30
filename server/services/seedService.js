import bcrypt from "bcryptjs";
import Role from "../models/Role.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Department from "../models/Department.js";
import Setting from "../models/Setting.js";

export async function seedSystem() {
  const roleData = [
    ["citizen", "Citizen"],
    ["official", "Official"],
    ["admin", "Administrator"]
  ];

  for (const [name, label] of roleData) await Role.updateOne({ name }, { $setOnInsert: { name, label } }, { upsert: true });

  const categories = [
    ["Pothole", "Road potholes and damaged surfaces", "⌁"],
    ["Garbage", "Garbage accumulation and sanitation", "▣"],
    ["Street Light", "Faulty or non-working street lights", "◉"],
    ["Water Leakage", "Water leakage and supply issues", "≈"],
    ["Drainage", "Blocked or damaged drainage", "≋"],
    ["Road Damage", "Broken roads and public pathways", "▱"],
    ["Electricity", "Public electricity infrastructure issues", "⚡"],
    ["Other", "Other civic issues", "＋"]
  ];

  for (const [name, description, icon] of categories) {
    await Category.updateOne({ name }, { $setOnInsert: { name, description, icon } }, { upsert: true });
  }

  const departments = [
    ["Roads & Public Works", "PWD", "Roads, potholes and public infrastructure"],
    ["Sanitation", "SAN", "Garbage and cleanliness"],
    ["Electrical Services", "ELE", "Street lights and public electrical systems"],
    ["Water Supply", "WTR", "Water supply and leakage"],
    ["Drainage", "DRN", "Drainage and wastewater"]
  ];

  for (const [name, code, description] of departments) {
    await Department.updateOne({ code }, { $setOnInsert: { name, code, description } }, { upsert: true });
  }

  const adminRole = await Role.findOne({ name: "admin" });
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const hash = await bcrypt.hash(password, 12);
  await User.updateOne(
    { email: (process.env.ADMIN_EMAIL || "admin@citizen.local").toLowerCase() },
    { $setOnInsert: { name: "System Administrator", email: (process.env.ADMIN_EMAIL || "admin@citizen.local").toLowerCase(), password: hash, role: adminRole._id, isActive: true } },
    { upsert: true }
  );

  await Setting.updateOne({ key: "portalName" }, { $set: { value: "JanConnect" } }, { upsert: true });
  await Setting.updateOne({ key: "portalTagline" }, { $set: { value: "Report. Track. Improve your city." } }, { upsert: true });
}
