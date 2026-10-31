import ActivityLog from "../models/ActivityLog.js";
import asyncHandler from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const items = await ActivityLog.find().populate("actor", "name email").sort({ createdAt: -1 }).limit(100);
  res.json({ items });
});
