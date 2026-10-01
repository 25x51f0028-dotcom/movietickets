const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("MongoDB connection failed: MONGO_URI is not defined in your backend/.env file.");
      console.error("Please add MONGO_URI to backend/.env (e.g., MONGO_URI=mongodb://127.0.0.1:27017/taskmanager or your MongoDB Atlas URI).");
      process.exit(1);
    }
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (error.message.includes("ECONNREFUSED")) {
      console.error("\nTroubleshooting tips:");
      console.error("1. If using a local MongoDB instance, verify that MongoDB service is installed and running.");
      console.error("2. If using MongoDB Atlas (cloud), update MONGO_URI in backend/.env with your cluster connection string.\n");
    }
    process.exit(1);
  }
};
module.exports = connectDB;
