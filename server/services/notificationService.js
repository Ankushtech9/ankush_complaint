import Notification from "../models/Notification.js";

export async function notify(user, title, message, complaint = null, type = "info") {
  if (!user) return null;
  return Notification.create({ user, title, message, complaint, type });
}
