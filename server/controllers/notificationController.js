import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).populate("complaint", "complaintNo title").sort({ createdAt: -1 }).limit(50);
  res.json({ items });
});

export const markRead = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
  if (!item) return res.status(404).json({ message: "Notification not found" });
  res.json({ item });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: "Notifications marked as read" });
});
