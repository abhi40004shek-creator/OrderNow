
"use strict";

const Product = require("../models/product.model");

async function searchProducts(req, res) {
  const query = String(req.query.q || "").trim();

  let filteredProducts = [];

  if (query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filteredProducts = await Product.find({
      $or: [
        { name: { $regex: escapedQuery, $options: "i" } },
        { category: { $regex: escapedQuery, $options: "i" } },
      ],
    }).sort({ createdAt: 1 });
  }

  return res.render("search/index", {
    title: query
      ? `Search results for "${query}" | OrderNow`
      : "Search Products | OrderNow",
    query,
    products: filteredProducts,
  });
}

module.exports = {
  searchProducts,
};
