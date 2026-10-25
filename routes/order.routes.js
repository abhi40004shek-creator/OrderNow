"use strict";

const express = require("express");
const {
  createOrder,
  showOrderConfirmation,
  showOrderHistory,
  showOrderDetails,
  showOrderTracking,
} = require("../controllers/order.controller");

const router = express.Router();

router.get("/:orderId/confirmation", showOrderConfirmation);
router.get("/history", showOrderHistory);
router.post("/", createOrder);
router.get("/:orderId/details", showOrderDetails);
router.get("/tracking", showOrderTracking);

module.exports = router;
