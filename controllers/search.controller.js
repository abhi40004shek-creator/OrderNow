
"use strict";

const products = require("../data/products");

function searchProducts(req, res) {
  const query = String(req.query.q || "").trim();

  const filteredProducts = query
    ? products.filter((product) =>
        `${product.name} ${product.category}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : [];

  res.render("search/index", {
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
