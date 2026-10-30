import express from "express";
import { listComplaints, getComplaint, createComplaint, updateComplaint, withdrawComplaint, assignComplaint, updateStatus } from "../controllers/complaintController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", listComplaints);
router.post("/", roles("citizen"), upload.single("image"), createComplaint);
router.get("/:id", getComplaint);
router.put("/:id", roles("citizen"), upload.single("image"), updateComplaint);
router.patch("/:id/withdraw", roles("citizen"), withdrawComplaint);
router.patch("/:id/assign", roles("admin"), assignComplaint);
router.patch("/:id/status", roles("official", "admin"), updateStatus);
export default router;
