import Complaint from "../models/Complaint.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import asyncHandler from "../utils/asyncHandler.js";
import complaintNumber from "../utils/complaintNumber.js";
import { notify } from "../services/notificationService.js";
import { logActivity } from "../services/logService.js";

export const listComplaints = asyncHandler(async (req, res) => {
  const { status, category, department, priority, search, page = 1, limit = 12 } = req.query;
  const query = {};
  const role = req.user.role.name;

  if (role === "citizen") query.citizen = req.user._id;
  if (role === "official") query.assignedTo = req.user._id;
  if (status) query.status = status;
  if (category) query.category = category;
  if (department) query.department = department;
  if (priority) query.priority = priority;
  if (search) query.$or = [
    { title: { $regex: search, $options: "i" } },
    { complaintNo: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } }
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Complaint.find(query).populate("category department citizen assignedTo", "name email label code").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Complaint.countDocuments(query)
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate("category department citizen assignedTo", "name email label code phone")
    .populate("timeline.changedBy", "name email");
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  const role = req.user.role.name;
  const canView = role === "admin" || complaint.citizen?._id.equals(req.user._id) || complaint.assignedTo?._id.equals(req.user._id);
  if (!canView) return res.status(403).json({ message: "Access denied" });
  res.json({ complaint });
});

export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, department, priority, address, city, latitude, longitude } = req.body;
  if (!title || !description || !category || !address) return res.status(400).json({ message: "Title, description, category and address are required" });
  const validCategory = await Category.findOne({ _id: category, isActive: true });
  if (!validCategory) return res.status(400).json({ message: "Invalid category" });
  const complaint = await Complaint.create({
    complaintNo: complaintNumber(),
    title,
    description,
    category,
    department: department || null,
    citizen: req.user._id,
    priority: priority || "Medium",
    location: { address, city: city || "", latitude: latitude || null, longitude: longitude || null },
    image: req.file ? `/uploads/${req.file.filename}` : "",
    timeline: [{ status: "Pending", note: "Complaint submitted by citizen", changedBy: req.user._id }]
  });
  if (department) {
    const officials = await User.find({ department, isActive: true }).populate("role");
    for (const official of officials.filter(x => x.role.name === "official")) await notify(official._id, "New complaint", `${complaint.complaintNo} has been submitted to your department`, complaint._id);
  }
  await logActivity({ actor: req.user._id, action: "Created complaint", entity: "Complaint", entityId: complaint._id.toString(), details: complaint.complaintNo });
  const result = await Complaint.findById(complaint._id).populate("category department citizen assignedTo", "name email label code");
  res.status(201).json({ complaint: result });
});

export const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  if (!complaint.citizen.equals(req.user._id)) return res.status(403).json({ message: "Only the complaint owner can edit it" });
  if (complaint.assignedTo || !["Pending", "In Review"].includes(complaint.status)) return res.status(400).json({ message: "Complaint can no longer be edited" });

  const allowed = ["title", "description", "category", "department", "priority"];
  allowed.forEach(key => { if (req.body[key] !== undefined) complaint[key] = req.body[key]; });
  if (req.body.address !== undefined) complaint.location.address = req.body.address;
  if (req.body.city !== undefined) complaint.location.city = req.body.city;
  if (req.file) complaint.image = `/uploads/${req.file.filename}`;
  await complaint.save();
  await logActivity({ actor: req.user._id, action: "Updated complaint", entity: "Complaint", entityId: complaint._id.toString() });
  res.json({ complaint });
});

export const withdrawComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint || !complaint.citizen.equals(req.user._id)) return res.status(404).json({ message: "Complaint not found" });
  if (complaint.assignedTo || !["Pending", "In Review"].includes(complaint.status)) return res.status(400).json({ message: "Complaint cannot be withdrawn now" });
  complaint.status = "Withdrawn";
  complaint.timeline.push({ status: "Withdrawn", note: "Complaint withdrawn by citizen", changedBy: req.user._id });
  await complaint.save();
  await logActivity({ actor: req.user._id, action: "Withdrew complaint", entity: "Complaint", entityId: complaint._id.toString() });
  res.json({ complaint });
});

export const assignComplaint = asyncHandler(async (req, res) => {
  const { officialId, departmentId } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  if (departmentId) {
    const department = await Department.findById(departmentId);
    if (!department) return res.status(400).json({ message: "Department not found" });
    complaint.department = departmentId;
  }
  if (officialId) {
    const official = await User.findById(officialId).populate("role");
    if (!official || official.role.name !== "official") return res.status(400).json({ message: "Invalid official" });
    complaint.assignedTo = officialId;
    await notify(officialId, "Complaint assigned", `${complaint.complaintNo} has been assigned to you`, complaint._id);
  }
  complaint.status = "In Review";
  complaint.timeline.push({ status: "In Review", note: "Complaint assigned for review", changedBy: req.user._id });
  await complaint.save();
  await notify(complaint.citizen, "Complaint assigned", `${complaint.complaintNo} is now under review`, complaint._id);
  await logActivity({ actor: req.user._id, action: "Assigned complaint", entity: "Complaint", entityId: complaint._id.toString() });
  res.json({ complaint: await Complaint.findById(complaint._id).populate("category department citizen assignedTo", "name email label code") });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status, note, resolutionNote } = req.body;
  const allowed = ["Pending", "In Review", "In Progress", "Resolved"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });

  const role = req.user.role.name;
  if (role === "official" && (!complaint.assignedTo || !complaint.assignedTo.equals(req.user._id))) return res.status(403).json({ message: "Complaint is not assigned to you" });
  if (role === "citizen") return res.status(403).json({ message: "Citizens cannot change status" });

  complaint.status = status;
  complaint.resolutionNote = resolutionNote || complaint.resolutionNote;
  complaint.resolvedAt = status === "Resolved" ? new Date() : null;
  complaint.timeline.push({ status, note: note || `Status changed to ${status}`, changedBy: req.user._id });
  await complaint.save();
  await notify(complaint.citizen, `Complaint ${status}`, `${complaint.complaintNo} is now ${status}`, complaint._id, status === "Resolved" ? "success" : "info");
  await logActivity({ actor: req.user._id, action: `Changed complaint status to ${status}`, entity: "Complaint", entityId: complaint._id.toString(), details: note || "" });
  res.json({ complaint: await Complaint.findById(complaint._id).populate("category department citizen assignedTo", "name email label code") });
});
