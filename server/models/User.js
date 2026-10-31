import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: "" },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
  address: { type: String, default: "" },
  avatar: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

userSchema.index({ name: "text", email: "text" });

export default mongoose.model("User", userSchema);
