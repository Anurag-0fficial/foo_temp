const express = require('express');
const router = express.Router();
const { upload } = require('../services/imageService');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Create a new product with image upload
router.post('/', upload.array('images', 5), createProduct);

// Get all products
router.get('/', getProducts);

// Get a single product
router.get('/:id', getProduct);

// Update a product with image upload
router.put('/:id', upload.array('images', 5), updateProduct);

// Delete a product
router.delete('/:id', deleteProduct);

module.exports = router; 