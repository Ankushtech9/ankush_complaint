import "dotenv/config";
import mongoose from "mongoose";

export default async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set. Add your MongoDB Atlas connection string in Render > Environment.");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000
  });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
