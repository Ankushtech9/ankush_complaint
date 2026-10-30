import express from "express";
import { list, update } from "../controllers/userController.js";
import { protect, roles } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, roles("admin"), list);
router.patch("/:id", protect, roles("admin"), update);
export default router;
