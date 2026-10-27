
"use strict";

const orderModel = require("../models/order.model");

async function showAdminOrders(req, res, next) {
  try {
    const orders = await orderModel.getAllOrders();

    return res.render("admin/orders/index", {
      title: "Admin Order Management",
      orders,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateAdminOrderStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const result = await orderModel.updateOrderStatus(orderId, status);

    if (result.error) {
      if (result.error === "Order not found.") {
        return res.status(404).render("error", {
          title: "Order Not Found",
          message: result.error,
        });
      }

      return res.status(400).render("error", {
        title: "Invalid Order Status",
        message: result.error,
      });
    }

    return res.redirect("/admin/orders");
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showAdminOrders,
  updateAdminOrderStatus,
};
