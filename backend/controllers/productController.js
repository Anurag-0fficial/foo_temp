const productService = require('../services/productService');
const { handleError } = require('../utils/errorHandler');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get all products with pagination
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const products = await productService.getProducts(page, limit);
    res.status(200).json({
      status: 'success',
      data: products
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    handleError(res, error);
  }
}; 