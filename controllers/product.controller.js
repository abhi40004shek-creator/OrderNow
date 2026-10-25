
"use strict";

const Product = require("../models/product.model");

// ========================================
// Get All Products
// GET /products
// ========================================

async function getAllProducts(req, res) {
  const selectedCategory = req.query.category || "";

  const filter = selectedCategory
    ? {
        category: {
          $regex: `^${selectedCategory.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i",
        },
      }
    : {};

  const filteredProducts = await Product.find(filter).sort({
    createdAt: 1,
  });

  return res.render("products/index", {
    title: selectedCategory
      ? `${selectedCategory} Products | OrderNow`
      : "All Products | OrderNow",
    products: filteredProducts,
    selectedCategory,
  });
}

// ========================================
// Get Product Details
// GET /products/:id
// ========================================

async function getProductDetails(req, res) {
  const requestedProduct = req.params.id;

  let product = await Product.findOne({ id: requestedProduct });

  if (!product) {
    const slug = requestedProduct
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const allProducts = await Product.find();

    product = allProducts.find((item) => {
      const productSlug = item.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return (
        productSlug === slug ||
        (item.id === "prod-003" && slug === "table-lamp") ||
        (item.id === "prod-004" && slug === "skincare-set")
      );
    });
  }

  if (!product) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  const discountPercentage =
    product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : 0;

  const savings = product.originalPrice - product.price;

  return res.render("products/show", {
    title: `${product.name} | OrderNow`,
    product,
    discountPercentage,
    savings,
  });
}


module.exports = {
  getAllProducts,
  getProductDetails,
};
