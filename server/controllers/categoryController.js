import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => res.json({ items: await Category.find().sort({ name: 1 }) }));

export const create = asyncHandler(async (req, res) => {
  const item = await Category.create({ name: req.body.name, description: req.body.description || "", icon: req.body.icon || "•" });
  res.status(201).json({ item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: "Category not found" });
  res.json({ item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!item) return res.status(404).json({ message: "Category not found" });
  res.json({ item });
});
