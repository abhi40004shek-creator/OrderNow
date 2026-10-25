
"use strict";

const express = require("express");
const productApiController = require("../../controllers/api/product.api.controller");

const router = express.Router();

// GET /api/products — Get all products
router.get("/", productApiController.getAllProducts);

// POST /api/products — Create a product
router.post("/", productApiController.createProduct);

// PUT /api/products/:id — Replace product fields
router.put("/:id", productApiController.updateProduct);

// PATCH /api/products/:id — Update selected fields
router.patch("/:id", productApiController.patchProduct);

// DELETE /api/products/:id — Delete product by ID
router.delete("/:id", productApiController.deleteProduct);

// GET /api/products/:id — Get product by ID
router.get("/:id", productApiController.getProductById);

module.exports = router;
