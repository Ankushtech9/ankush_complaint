import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";

export const stats = asyncHandler(async (req, res) => {
  const role = req.user.role.name;
  const base = role === "citizen" ? { citizen: req.user._id } : role === "official" ? { assignedTo: req.user._id } : {};
  const [total, pending, review, progress, resolved, users, departments, categories, byCategory, byDepartment] = await Promise.all([
    Complaint.countDocuments(base),
    Complaint.countDocuments({ ...base, status: "Pending" }),
    Complaint.countDocuments({ ...base, status: "In Review" }),
    Complaint.countDocuments({ ...base, status: "In Progress" }),
    Complaint.countDocuments({ ...base, status: "Resolved" }),
    role === "admin" ? User.countDocuments() : Promise.resolve(0),
    role === "admin" ? Department.countDocuments({ isActive: true }) : Promise.resolve(0),
    role === "admin" ? Category.countDocuments({ isActive: true }) : Promise.resolve(0),
    Complaint.aggregate([
      { $match: base },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]),
    Complaint.aggregate([
      { $match: base },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ])
  ]);
  const [categoryNames, departmentNames] = await Promise.all([
    Category.find({ _id: { $in: byCategory.map(x => x._id).filter(Boolean) } }, "name"),
    Department.find({ _id: { $in: byDepartment.map(x => x._id).filter(Boolean) } }, "name")
  ]);
  const categoryMap = Object.fromEntries(categoryNames.map(x => [x._id.toString(), x.name]));
  const departmentMap = Object.fromEntries(departmentNames.map(x => [x._id.toString(), x.name]));
  res.json({
    total, pending, review, progress, resolved, users, departments, categories,
    byCategory: byCategory.map(x => ({ name: categoryMap[x._id?.toString()] || "Unassigned", count: x.count })),
    byDepartment: byDepartment.map(x => ({ name: departmentMap[x._id?.toString()] || "Unassigned", count: x.count }))
  });
});
