import mongoose from "mongoose";

// db connection
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL as string);
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${(error as Error).message}`);
    // Exit process with failure
    process.exit(1);
  }
};
