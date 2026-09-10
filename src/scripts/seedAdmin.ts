import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import Admin from "../models/Admin";

const run = async () => {
  await connectDB();

  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding.");
    process.exit(1);
  }

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin with email ${email} already exists. Skipping.`);
  } else {
    await Admin.create({ name, email: email.toLowerCase(), password });
    console.log(`Admin account created for ${email}.`);
    console.log("IMPORTANT: log in and consider rotating this password.");
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
