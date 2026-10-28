
"use strict";

const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

// Show login page
function showLoginPage(req, res) {
  const successMessage = req.session.successMessage;
  delete req.session.successMessage;

  return res.render("auth/login", {
    title: "Sign In | OrderNow",
    successMessage,
  });
}

// Show signup page
function showSignupPage(req, res) {
  return res.render("auth/signup", {
    title: "Create Account | OrderNow",
  });
}

// Register a new customer
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid signup details.",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 2 to 60 characters.",
      });
    }

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must contain 8 to 72 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).lean();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    req.session.successMessage =
      "Account created successfully! Please sign in.";

    return req.session.save((error) => {
      if (error) {
        return next(error);
      }

      return res.redirect("/account/login");
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return next(error);
  }
}

// Authenticate an existing customer
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).send("Please enter your email and password.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Invalid email or password.");
    }

    // Regenerate session to help prevent session fixation.
    req.session.regenerate((error) => {
      if (error) {
        return next(error);
      }

      req.session.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };

      req.session.save((saveError) => {
        if (saveError) {
          return next(saveError);
        }

        return res.redirect("/");
      });
    });
  } catch (error) {
    return next(error);
  }
}
// Log out the current user
function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie("ordernow.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.redirect("/account/login");
  });
}

module.exports = {
  login,
  signup,
  showLoginPage,
  showSignupPage,
  logout,
};
