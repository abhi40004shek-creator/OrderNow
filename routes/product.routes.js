
"use strict";

const express = require("express");
const productController = require("../controllers/product.controller");

const router = express.Router();

// Products listing page
router.get("/", productController.getAllProducts);

// Product details page
router.get("/:id", productController.getProductDetails);

module.exports = router;
