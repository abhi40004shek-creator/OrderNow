
"use strict";

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Fashion", "Home & Living", "Beauty"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer.",
      },
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

async function decreaseStock(productId, quantity) {
  if (
    typeof productId !== "string" ||
    !productId.trim() ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return null;
  }

  return Product.findOneAndUpdate(
    {
      id: productId.trim(),
      stock: { $gte: quantity },
    },
    {
      $inc: { stock: -quantity },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();
}

// Keep existing Product imports working.
Product.decreaseStock = decreaseStock;

module.exports = Product;
