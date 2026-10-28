
"use strict";

const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// Authentication pages
router.get("/login", authController.showLoginPage);
router.get("/signup", authController.showSignupPage);

// Authentication actions
router.post("/signup", authController.signup);
router.post("/login", authController.login);

module.exports = router;
