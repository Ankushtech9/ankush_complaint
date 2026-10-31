import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  complaintNo: { type: String, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  location: {
    address: { type: String, required: true },
    city: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
  status: { type: String, enum: ["Pending", "In Review", "In Progress", "Resolved", "Withdrawn"], default: "Pending" },
  image: { type: String, default: "" },
  resolutionNote: { type: String, default: "" },
  resolvedAt: { type: Date, default: null },
  timeline: [{
    status: String,
    note: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

complaintSchema.index({ title: "text", description: "text", complaintNo: "text" });

export default mongoose.model("Complaint", complaintSchema);
