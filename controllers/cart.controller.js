
"use strict";

const cartModel = require("../models/cart.model");

async function showCart(req, res) {
  try {
    const title = await cartModel.getCartTitle();

    return res.render("cart/index", {
      title,
    });
  } catch {
  return res.status(500).render("error", {
    title: "Server Error | OrderNow",
    message: "Unable to load your shopping cart.",
  });
}
}

async function getCartProduct(req, res, next) {
  try {
    const product = await cartModel.getProductPrice(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showCart,
  getCartProduct,
};
