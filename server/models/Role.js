import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, enum: ["citizen", "official", "admin"], unique: true, required: true },
  label: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Role", roleSchema);
