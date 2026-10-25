
"use strict";

const orderModel = require("../models/order.model");
const cartModel = require("../models/cart.model");

function createOrder(req, res, next) {
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
    let subtotal = 0;

    for (const requestedItem of items) {
      if (
        !requestedItem ||
        typeof requestedItem.id !== "string" ||
        !Number.isInteger(requestedItem.quantity) ||
        requestedItem.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity in your order.",
        });
      }

      const product = cartModel.getProductPrice(requestedItem.id);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products could not be found.",
        });
      }

      if (
        product.stock < 1 ||
        requestedItem.quantity > product.stock
      ) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has insufficient stock.`,
        });
      }

      validatedItems.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: requestedItem.quantity,
      });

      subtotal += product.price * requestedItem.quantity;
    }

    const shipping = 0;
    const order = orderModel.createOrder({
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
    return next(error);
  }
}

function showOrderConfirmation(req, res, next) {
  try {
    const order = orderModel.findOrderById(req.params.orderId);

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


function showOrderHistory(req, res, next) {
  try {
    const orders = orderModel.getAllOrders();

    return res.render("orders/history", {
      title: "My Orders | OrderNow",
      orders,
    });
  } catch (error) {
    return next(error);
  }
}


function showOrderDetails(req, res, next) {
  try {
    const order = orderModel.findOrderById(req.params.orderId);

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


function showOrderTracking(req, res, next) {
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

    const order = orderModel.findOrderById(orderId);

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
