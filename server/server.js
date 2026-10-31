import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { seedSystem } from "./services/seedService.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

<<<<<<< HEAD
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Render injects PORT at runtime. Allow requests without an Origin header (health checks)
// and restrict browser origins when CLIENT_URL is configured.
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));
=======
app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || "*", credentials: true }));
>>>>>>> 39148f81eadb3bfdcdb2e3b6911a75ded6ffce4f
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

<<<<<<< HEAD
app.get("/", (req, res) => res.json({ success: true, name: "JanConnect API", health: "/api/health" }));
=======
>>>>>>> 39148f81eadb3bfdcdb2e3b6911a75ded6ffce4f
app.get("/api/health", (req, res) => res.json({ success: true, message: "Citizen Complaint API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity-logs", activityRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedSystem();
<<<<<<< HEAD
  app.listen(port, "0.0.0.0", () => console.log(`JanConnect API running on port ${port}`));
=======
  app.listen(port, () => console.log(`API running on port ${port}`));
>>>>>>> 39148f81eadb3bfdcdb2e3b6911a75ded6ffce4f
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
