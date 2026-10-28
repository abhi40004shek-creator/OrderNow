
"use strict";

const Product = require("./product.model");

async function findProductById(productId) {
  return Product.findOne({ id: productId }).lean();
}

async function getProductPrice(productId) {
  const product = await findProductById(productId);

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

function getCartTitle() {
  return "Your Shopping Cart";
}

module.exports = {
  findProductById,
  getProductPrice,
  getCartTitle,
};
