import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  action: { type: String, required: true },
  entity: { type: String, default: "" },
  entityId: { type: String, default: "" },
  details: { type: String, default: "" },
  ip: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("ActivityLog", activityLogSchema);
