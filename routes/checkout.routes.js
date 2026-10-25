
"use strict";

const express = require("express");
const { showCheckout } = require("../controllers/checkout.controller");

const router = express.Router();

router.get("/", showCheckout);

module.exports = router;
