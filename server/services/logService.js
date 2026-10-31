import ActivityLog from "../models/ActivityLog.js";

export async function logActivity({ actor, action, entity = "", entityId = "", details = "", ip = "" }) {
  return ActivityLog.create({ actor, action, entity, entityId, details, ip });
}
