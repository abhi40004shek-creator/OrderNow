
"use strict";

const express = require("express");
const {
  showAdminOrders,
  updateAdminOrderStatus,
} = require("../controllers/admin.controller");

const { requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAdmin, (req, res) => {
  return res.redirect("/admin/orders");
});

router.get("/orders", requireAdmin, showAdminOrders);

router.post(
  "/orders/:orderId/status",
  requireAdmin,
  updateAdminOrderStatus
);

module.exports = router;
