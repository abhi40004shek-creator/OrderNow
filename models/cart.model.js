
"use strict";

const products = require("../data/products");

function findProductById(productId) {
  return products.find((product) => product.id === productId) || null;
}

function getProductPrice(productId) {
  const product = findProductById(productId);

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    image: product.image,
    price: product.price,
    originalPrice: product.originalPrice,
    stock: product.stock,
  };
}

module.exports = {
  findProductById,
  getProductPrice,
};
