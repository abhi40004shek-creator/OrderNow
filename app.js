
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
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");
const adminRoutes = require("./routes/admin.routes");
const productApiRoutes = require("./routes/api/product.routes");
const authController = require("./controllers/auth.controller");


const session = require("express-session");
const { MongoStore } = require("connect-mongo");
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
// Session Configuration
// ================================

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from environment variables.");
}

app.use(
  session({
    name: "ordernow.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Make the logged-in user available to all EJS views
app.use((req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  next();
});

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

app.use("/api/auth", authRoutes);

app.use("/account", accountRoutes);

app.use("/admin", adminRoutes);

app.post("/logout", authController.logout);

// ================================
// Error Handling
// Keep these handlers last
// ================================

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
