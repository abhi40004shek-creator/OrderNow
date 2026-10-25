"use strict";

function notFoundHandler(req, res, next) {
  const error = new Error(`Page not found: ${req.originalUrl}`);
  error.status = 404;

  next(error);
}

function errorHandler(err, req, res, _next) {
  const statusCode = err.status || err.statusCode || 500;

  console.error(`[${statusCode}] ${err.message}`);

  res.status(statusCode).render("error", {
    title: statusCode === 404 ? "Page Not Found | OrderNow" : "Server Error | OrderNow",
    statusCode,
    message:
      statusCode === 404
        ? "The page you're looking for could not be found."
        : "Something went wrong. Please try again later.",
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};