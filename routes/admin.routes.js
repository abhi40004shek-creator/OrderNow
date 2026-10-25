
"use strict";

const express = require("express");
const {
  showAdminOrders,
  updateAdminOrderStatus,
} = require("../controllers/admin.controller");

const router = express.Router();

router.get("/", (req, res) => {
  return res.redirect("/admin/orders");
});

router.get("/orders", showAdminOrders);

router.post("/orders/:orderId/status", updateAdminOrderStatus);

module.exports = router;
