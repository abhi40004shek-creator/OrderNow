
"use strict";

const express = require("express");

const {
  showCart,
  getCartProduct,
} = require("../controllers/cart.controller");

const router = express.Router();

router.get("/", showCart);
router.get("/product/:productId", getCartProduct);

module.exports = router;
