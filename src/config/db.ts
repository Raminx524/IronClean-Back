import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  console.log("Connecting to MongoDB with URI:", mongoUri);

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in .env file");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error", error);
    }
    process.exit(1);
  }
};

export default connectDB;
