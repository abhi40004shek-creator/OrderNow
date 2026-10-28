
"use strict";

const express = require("express");
const { showCheckout } = require("../controllers/checkout.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// Checkout requires an authenticated user
router.get("/", requireAuth, showCheckout);

module.exports = router;
