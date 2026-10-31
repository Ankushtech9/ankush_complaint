import "dotenv/config";
import mongoose from "mongoose";

export default async function connectDB() {
<<<<<<< HEAD
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set. Add your MongoDB Atlas connection string in Render > Environment.");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000
  });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
=======
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from server/.env");
  }

  const connection = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${connection.connection.host}`);
}
>>>>>>> 39148f81eadb3bfdcdb2e3b6911a75ded6ffce4f
