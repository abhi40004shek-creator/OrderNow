"use strict";

const allowedCategories = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
];

function validateProduct(payload, { partial = false } = {}) {
  const errors = [];

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return ["Request body must be a JSON object."];
  }

  const required = (field) =>
    !partial || Object.prototype.hasOwnProperty.call(payload, field);

  if (
    required("name") &&
    (typeof payload.name !== "string" || !payload.name.trim())
  ) {
    errors.push("Name is required and must be a non-empty string.");
  }

  if (
    required("category") &&
    (typeof payload.category !== "string" ||
      !allowedCategories.includes(payload.category.trim()))
  ) {
    errors.push(`Category must be one of: ${allowedCategories.join(", ")}.`);
  }

  for (const field of ["price", "originalPrice"]) {
    if (
      required(field) &&
      (typeof payload[field] !== "number" ||
        !Number.isFinite(payload[field]) ||
        payload[field] < 0)
    ) {
      errors.push(`${field} must be a non-negative number.`);
    }
  }

  if (
    required("stock") &&
    (!Number.isInteger(payload.stock) || payload.stock < 0)
  ) {
    errors.push("Stock must be a non-negative integer.");
  }

  for (const field of ["image", "description"]) {
    if (
      required(field) &&
      (typeof payload[field] !== "string" || !payload[field].trim())
    ) {
      errors.push(`${field} must be a non-empty string.`);
    }
  }

  const allowedFields = [
    "name",
    "category",
    "price",
    "originalPrice",
    "stock",
    "image",
    "description",
  ];

  const unknownFields = Object.keys(payload).filter(
    (field) => !allowedFields.includes(field)
  );

  if (unknownFields.length > 0) {
    errors.push(`Unknown fields: ${unknownFields.join(", ")}.`);
  }

  return errors;
}

module.exports = { validateProduct };