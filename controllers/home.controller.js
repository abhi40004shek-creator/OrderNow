
"use strict";

function getHomePage(req, res) {
  res.render("home/index", {
    title: "OrderNow | Online Shopping",
  });
}

module.exports = {
  getHomePage,
};
