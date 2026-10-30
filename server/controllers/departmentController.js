import Department from "../models/Department.js";
import asyncHandler from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => res.json({ items: await Department.find().sort({ name: 1 }) }));

export const create = asyncHandler(async (req, res) => {
  const item = await Department.create({ name: req.body.name, code: req.body.code, description: req.body.description || "" });
  res.status(201).json({ item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: "Department not found" });
  res.json({ item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!item) return res.status(404).json({ message: "Department not found" });
  res.json({ item });
});
