
"use strict";

const express = require("express");

const {
  showCart,
  getCartProduct,
} = require("../controllers/cart.controller");

const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// Cart routes require authentication
router.get("/", requireAuth, showCart);
router.get("/product/:productId", requireAuth, getCartProduct);

module.exports = router;
