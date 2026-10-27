
"use strict";

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number.",
      },
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must contain at least one item.",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const Order = mongoose.model("Order", orderSchema);

async function createOrder(orderData) {
  const order = new Order({
    id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    customer: {
      fullName: orderData.fullName,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      postalCode: orderData.postalCode,
    },
    items: orderData.items,
    subtotal: orderData.subtotal,
    shipping: orderData.shipping,
    total: orderData.total,
    status: "Pending",
  });

  return order.save();
}

async function findOrderById(orderId) {
  return Order.findOne({ id: orderId }).lean();
}

async function getAllOrders() {
  return Order.find().sort({ createdAt: -1 }).lean();
}

async function updateOrderStatus(orderId, newStatus) {
  const allowedStatuses = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    return { error: "Invalid order status." };
  }

  const order = await Order.findOneAndUpdate(
    { id: orderId },
    { $set: { status: newStatus } },
    { new: true, runValidators: true }
  ).lean();

  if (!order) {
    return { error: "Order not found." };
  }

  return { order };
}

module.exports = {
  createOrder,
  findOrderById,
  getAllOrders,
  updateOrderStatus,
};

