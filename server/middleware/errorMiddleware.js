export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.name === "ValidationError") return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(", ") });
  if (error.code === 11000) return res.status(409).json({ message: "A record with the same value already exists" });
  res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
}
