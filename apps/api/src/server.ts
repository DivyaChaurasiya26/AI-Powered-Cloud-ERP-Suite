import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { connectDB } from "./database/db";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
  console.log(
    "MONGO_URI starts with:",
    process.env.MONGO_URI?.substring(0, 30)
  );

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();