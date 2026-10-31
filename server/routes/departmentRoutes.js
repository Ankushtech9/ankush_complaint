import express from "express";
import { list, create, update, remove } from "../controllers/departmentController.js";
import { protect, roles } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, list);
router.post("/", protect, roles("admin"), create);
router.put("/:id", protect, roles("admin"), update);
router.delete("/:id", protect, roles("admin"), remove);
export default router;
