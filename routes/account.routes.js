"use strict";

const express = require("express");
const router = express.Router();

const {
  showLoginPage,
  showSignupPage,
} = require("../controllers/auth.controller");

// Account pages
router.get("/login", showLoginPage);
router.get("/signup", showSignupPage);

module.exports = router;