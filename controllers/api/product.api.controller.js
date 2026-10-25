
"use strict";

const products = require("../../data/products");
const { validateProduct } = require("../../utils/product.validation");

const editableFields = [
  "name",
  "category",
  "price",
  "originalPrice",
  "stock",
  "image",
  "description",
];

function getAllProducts(req, res) {
  return res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
}

function getProductById(req, res) {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: product,
  });
}

function createProduct(req, res) {
  const errors = validateProduct(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const {
    name,
    category,
    price,
    originalPrice,
    stock,
    image,
    description,
  } = req.body;

  const newProduct = {
    id: `prod-${Date.now()}`,
    name: name.trim(),
    category: category.trim(),
    price,
    originalPrice,
    rating: 0,
    stock,
    image: image.trim(),
    description: description.trim(),
  };

  products.push(newProduct);

  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: newProduct,
  });
}

// PUT /api/products/:id — Replace editable product fields
function updateProduct(req, res) {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const errors = validateProduct(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  for (const field of editableFields) {
    const value = req.body[field];

    product[field] =
      typeof value === "string" ? value.trim() : value;
  }

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
}

// PATCH /api/products/:id — Update selected product fields
function patchProduct(req, res) {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body) ||
    Object.keys(req.body).length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update",
    });
  }

  const errors = validateProduct(req.body, { partial: true });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  for (const field of editableFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      const value = req.body[field];

      product[field] =
        typeof value === "string" ? value.trim() : value;
    }
  }

  return res.status(200).json({
    success: true,
    message: "Product partially updated successfully",
    data: product,
  });
}


function deleteProduct(req, res) {
  const productIndex = products.findIndex(
    (item) => item.id === req.params.id
  );

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const [deletedProduct] = products.splice(productIndex, 1);

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: deletedProduct,
  });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
};
