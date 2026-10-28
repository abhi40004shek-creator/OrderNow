
"use strict";

const orderModel = require("../models/order.model");
const cartModel = require("../models/cart.model");
const Product = require("../models/product.model");


async function createOrder(req, res, next) {
  const decrementedItems = [];

  async function restoreStock() {
    for (const item of [...decrementedItems].reverse()) {
      await Product.updateOne(
        { id: item.id },
        { $inc: { stock: item.quantity } }
      );
    }

    decrementedItems.length = 0;
  }

  try {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      postalCode,
      items,
    } = req.body;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      typeof city !== "string" ||
      typeof postalCode !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !/^[1-9][0-9]{5}$/.test(postalCode.trim()) ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid checkout details and order items.",
      });
    }

    const validatedItems = [];
    const seenProductIds = new Set();
    let subtotal = 0;

    for (const requestedItem of items) {
      if (
        !requestedItem ||
        typeof requestedItem.id !== "string" ||
        !requestedItem.id.trim() ||
        !Number.isInteger(requestedItem.quantity) ||
        requestedItem.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity in your order.",
        });
      }

      const productId = requestedItem.id.trim();
      const quantity = requestedItem.quantity;

      if (seenProductIds.has(productId)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate products are not allowed in an order.",
        });
      }

      seenProductIds.add(productId);

      const product = await cartModel.getProductPrice(productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products could not be found.",
        });
      }

      if (
        !Number.isInteger(product.stock) ||
        product.stock < 0 ||
        !Number.isFinite(product.price) ||
        product.price < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Product price or stock is invalid.",
        });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has insufficient stock.`,
        });
      }

      const itemTotal = product.price * quantity;

      if (!Number.isSafeInteger(itemTotal)) {
        return res.status(400).json({
          success: false,
          message: "Order total is invalid.",
        });
      }

      subtotal += itemTotal;

      if (!Number.isSafeInteger(subtotal)) {
        return res.status(400).json({
          success: false,
          message: "Order total is invalid.",
        });
      }

      validatedItems.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      });
    }

    // Atomically reserve stock for each product.
    for (const item of validatedItems) {
      const updatedProduct = await Product.decreaseStock(
        item.id,
        item.quantity
      );

      if (!updatedProduct) {
        await restoreStock();

        return res.status(400).json({
          success: false,
          message: `${item.name} has insufficient stock. Please try again.`,
        });
      }

      decrementedItems.push({
        id: item.id,
        quantity: item.quantity,
      });
    }

    const shipping = 0;

    try {
      const order = await orderModel.createOrder({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        items: validatedItems,
        subtotal,
        shipping,
        total: subtotal + shipping,
      });

      // Order saved successfully; keep the stock reduction.
      decrementedItems.length = 0;

      return res.status(201).json({
        success: true,
        message: "Order created successfully.",
        order: {
          id: order.id,
          status: order.status,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          createdAt: order.createdAt,
        },
      });
    } catch (error) {
      try {
        await restoreStock();
      } catch (restoreError) {
        console.error(
          "CRITICAL: Failed to restore product stock after order creation failed.",
          restoreError
        );
      }

      throw error;
    }
  } catch (error) {
    if (decrementedItems.length > 0) {
      try {
        await restoreStock();
      } catch (restoreError) {
        console.error(
          "CRITICAL: Failed to restore product stock.",
          restoreError
        );
      }
    }

    return next(error);
  }
}


async function showOrderConfirmation(req, res, next) {
  try {
    const order = await orderModel.findOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).render("error", {
        title: "Order Not Found | OrderNow",
        message: "The requested order could not be found.",
      });
    }

    return res.render("orders/confirmation", {
      title: "Order Confirmation | OrderNow",
      order,
    });
  } catch (error) {
    return next(error);
  }
}

async function showOrderHistory(req, res, next) {
  try {
    const orders = await orderModel.getAllOrders();

    return res.render("orders/history", {
      title: "My Orders | OrderNow",
      orders,
    });
  } catch (error) {
    return next(error);
  }
}

async function showOrderDetails(req, res, next) {
  try {
    const order = await orderModel.findOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).render("error", {
        title: "Order Not Found | OrderNow",
        message: "The requested order could not be found.",
      });
    }

    return res.render("orders/details", {
      title: "Order Details | OrderNow",
      order,
    });
  } catch (error) {
    return next(error);
  }
}

async function showOrderTracking(req, res, next) {
  try {
    const orderId =
      typeof req.query.orderId === "string"
        ? req.query.orderId.trim()
        : "";

    if (!orderId) {
      return res.render("orders/tracking", {
        title: "Track Order | OrderNow",
        orderId: "",
      });
    }

    const order = await orderModel.findOrderById(orderId);

    if (!order) {
      return res.status(404).render("orders/tracking", {
        title: "Track Order | OrderNow",
        orderId,
        order: null,
        errorMessage: "Order not found. Please check your Order ID.",
      });
    }

    return res.render("orders/tracking", {
      title: "Track Order | OrderNow",
      orderId,
      order,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  showOrderConfirmation,
  showOrderHistory,
  showOrderDetails,
  showOrderTracking,
};
