
"use strict";

function showCheckout(req, res, next) {
  try {
    return res.render("checkout/index", {
      title: "Checkout | OrderNow",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showCheckout,
};
