
"use strict";

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

async function createAdmin() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from .env");
  }

  if (!name || !email || !password) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in .env"
    );
  }

  if (name.length < 2 || name.length > 60) {
    throw new Error("Admin name must contain 2 to 60 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid admin email.");
  }

  if (password.length < 8 || password.length > 72) {
    throw new Error("Admin password must contain 8 to 72 characters.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existingUser = await User.findOne({ email }).select("+password");

  if (existingUser) {
    existingUser.role = "admin";
    await existingUser.save();
    console.log("Existing user promoted to admin:", email);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin account created:", email);
}

createAdmin()
  .catch((error) => {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
