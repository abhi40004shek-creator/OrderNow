
"use strict";

const Product = require("../models/product.model");

async function getWishlistPage(req, res, next) {
  try {
    const wishlistIds = req.session.wishlist || [];

    const products = wishlistIds.length
      ? await Product.find({ id: { $in: wishlistIds } })
      : [];

    // Keep products in the order they were added.
    const wishlist = wishlistIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean);

    return res.render("wishlist/index", {
      title: "My Wishlist | OrderNow",
      wishlist,
    });
  } catch (error) {
    return next(error);
  }
}

async function addToWishlist(req, res) {
  const { productId } = req.body;

  if (!productId || typeof productId !== "string") {
    return res.status(400).json({
      success: false,
      message: "A valid product ID is required.",
    });
  }

  const product = await Product.findOne({ id: productId });

if (!product) {
  return res.status(404).json({
    success: false,
    message: "Product not found.",
  });
}

  if (!req.session.wishlist) {
    req.session.wishlist = [];
  }

  if (!req.session.wishlist.includes(productId)) {
    req.session.wishlist.push(productId);
  }

  return res.status(200).json({
    success: true,
    message: "Product added to wishlist.",
    wishlist: req.session.wishlist,
  });
}

function removeFromWishlist(req, res) {
  const { productId } = req.body;

  if (!productId || typeof productId !== "string") {
    return res.status(400).json({
      success: false,
      message: "A valid product ID is required.",
    });
  }

  req.session.wishlist = (req.session.wishlist || []).filter(
    (id) => id !== productId
  );

  return res.status(200).json({
    success: true,
    message: "Product removed from wishlist.",
    wishlist: req.session.wishlist,
  });
}

module.exports = {
  getWishlistPage,
  addToWishlist,
  removeFromWishlist,
};
