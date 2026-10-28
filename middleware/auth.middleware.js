
"use strict";

// Require a logged-in user
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect("/account/login");
  }

  return next();
}

// Require an admin user
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect("/account/login");
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).render("errors/403", {
      title: "Access Denied | OrderNow",
    });
  }

  return next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
