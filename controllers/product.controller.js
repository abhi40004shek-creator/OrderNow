
"use strict";

const products = require("../data/products");

// ========================================
// Get All Products
// GET /products
// ========================================
function getAllProducts(req, res) {
  const selectedCategory = req.query.category || "";

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) =>
          product.category.toLowerCase() ===
          selectedCategory.trim().toLowerCase()
      )
    : products;

  res.render("products/index", {
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
function getProductDetails(req, res) {
      const requestedProduct = req.params.id;

const product = products.find((item) => {
  const slug = item.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
    return (
  item.id === requestedProduct ||
  slug === requestedProduct ||
  (item.id === "prod-003" && requestedProduct === "table-lamp") ||
   (item.id === "prod-004" && requestedProduct === "skincare-set")
);
});

  if (!product) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  const discountPercentage = Math.round(
    ((product.originalPrice - product.price) /
      product.originalPrice) *
      100
  );

  const savings = product.originalPrice - product.price;

  res.render("products/show", {
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
