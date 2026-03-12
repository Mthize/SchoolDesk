import mongoose from "mongoose";

// db connection
export const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined");
    }

    const dbName = process.env.MONGO_DB_NAME;
    const conn = await mongoose.connect(mongoUrl, dbName ? { dbName } : undefined);
    const suffix = dbName ? `/${dbName}` : "";
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}${suffix}`);
  } catch (error) {
    console.error(`❌ Error: ${(error as Error).message}`);
    // Exit process with failure
    process.exit(1);
  }
};
