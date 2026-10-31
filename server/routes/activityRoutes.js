import express from "express";
import { list } from "../controllers/activityController.js";
import { protect, roles } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, roles("admin"), list);
export default router;
