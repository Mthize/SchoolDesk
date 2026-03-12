import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User, UserRole } from "../models/user";

const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Test Admin";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@schooldesk.test";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined. Check your backend/.env file.");
    }

    await connectDB();

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`✔️  Admin user already exists (${ADMIN_EMAIL}). Skipping.`);
      return;
    }

    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: UserRole.ADMIN,
      isActive: true,
    });

    console.log("✅ Admin user created successfully:");
    console.log({
      id: admin._id.toString(),
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: admin.role,
    });
  } catch (error) {
    console.error("❌ Failed to seed admin user", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void seedAdmin();
