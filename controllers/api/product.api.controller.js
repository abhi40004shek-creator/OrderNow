
"use strict";

const Product = require("../../models/product.model");
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

async function getAllProducts(req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findOne({ id: req.params.id });

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
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
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

    const newProduct = await Product.create({
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      price,
      originalPrice,
      rating: 0,
      stock,
      image: image.trim(),
      description: description.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /api/products/:id — Replace editable product fields
async function updateProduct(req, res, next) {
  try {
    const errors = validateProduct(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const updates = {};

    for (const field of editableFields) {
      const value = req.body[field];
      updates[field] =
        typeof value === "string" ? value.trim() : value;
    }

    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
}

// PATCH /api/products/:id — Update selected product fields
async function patchProduct(req, res, next) {
  try {
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

    const updates = {};

    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        const value = req.body[field];

        updates[field] =
          typeof value === "string" ? value.trim() : value;
      }
    }

    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product partially updated successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const deletedProduct = await Product.findOneAndDelete({
      id: req.params.id,
    });

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
};
