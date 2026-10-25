"use strict";


function getWishlistPage(req, res) {
  res.render("wishlist/index", {
    title: "My Wishlist | OrderNow",
    wishlist: [],
  });
}

module.exports = {
  getWishlistPage,
};