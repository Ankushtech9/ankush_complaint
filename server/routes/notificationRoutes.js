import express from "express";
import { list, markRead, markAllRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", list);
// Keep the fixed route before the parameterized route for clarity and future-safe matching.
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);
export default router;
