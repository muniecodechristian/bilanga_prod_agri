import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri);
    console.log("Connected to DB SUCCESSFULLY  ");
  } catch (error) {
    console.log("Error connecting to MONGODB");
    process.exit(1);
  }
};
