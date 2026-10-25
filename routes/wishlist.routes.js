"use strict";

const express = require("express");
const wishlistController = require("../controllers/wishlist.controller");

const router = express.Router();

router.get("/", wishlistController.getWishlistPage);

module.exports = router;