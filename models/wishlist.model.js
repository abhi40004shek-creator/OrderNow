"use strict";

const products = require("../data/products");

function findProductById(productId) {
  return products.find((product) => product.id === productId) || null;
}

module.exports = {
  findProductById,
};