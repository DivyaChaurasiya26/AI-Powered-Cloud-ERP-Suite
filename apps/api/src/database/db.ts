import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      // Route reads to secondaries when a replica set is available.
      // Falls back to primary when only a standalone node is configured.
      readPreference: "secondaryPreferred",
      // Connection pool: 20 connections supports ~2,000 VU load.
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB Connected");

  } catch (error) {
    console.error("Database Connection Failed", error);

    process.exit(1);
  }
};