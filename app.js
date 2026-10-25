
"use strict";

const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

// Routes
const homeRoutes = require("./routes/home.routes");
const searchRoutes = require("./routes/search.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const checkoutRoutes = require("./routes/checkout.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const productApiRoutes = require("./routes/api/product.routes");

// Error-handling middleware
const {
  notFoundHandler,
  errorHandler,
} = require("./middleware/errorHandler");

const app = express();

// ================================
// View Engine Configuration
// ================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================================
// Application Middleware
// ================================

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// ================================
// EJS Layout Configuration
// ================================

app.use(expressLayouts);
app.set("layout", "layouts/main");

// ================================
// Application Routes
// ================================

app.use("/", homeRoutes);

app.use("/search", searchRoutes);

app.use("/products", productRoutes);

app.use("/api/products", productApiRoutes);

app.use("/wishlist", wishlistRoutes);

app.use("/cart", cartRoutes);

app.use("/checkout", checkoutRoutes);

app.use("/api/orders", orderRoutes);

app.use("/admin", adminRoutes);

// ================================
// Error Handling
// Keep these handlers last
// ================================

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
