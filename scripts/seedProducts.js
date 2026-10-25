
"use strict";

require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/product.model");
const products = require("../data/products");

async function seedProducts() {
  try {
    await connectDB();

    for (const product of products) {
      await Product.updateOne(
        { id: product.id },
        { $setOnInsert: product },
        { upsert: true, runValidators: true }
      );
    }

    console.log(`${products.length} products processed successfully.`);
  } catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
