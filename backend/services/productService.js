const Product = require('../models/Product');
const { deleteImages } = require('./imageService');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Create a new product
 * @param {Object} productData - The product data
 * @returns {Promise<Object>} The created product
 */
const createProduct = async (productData) => {
  try {
    const product = new Product(productData);
    await product.save();
    return product;
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new ValidationError(error.message);
    }
    throw error;
  }
};

/**
 * Get all products with pagination
 * @param {number} page - The page number
 * @param {number} limit - The number of items per page
 * @returns {Promise<Object>} The paginated products
 */
const getProducts = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const products = await Product.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await Product.countDocuments();
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get a product by ID
 * @param {string} id - The product ID
 * @returns {Promise<Object>} The product
 */
const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  return product;
};

/**
 * Update a product
 * @param {string} id - The product ID
 * @param {Object} updateData - The update data
 * @returns {Promise<Object>} The updated product
 */
const updateProduct = async (id, updateData) => {
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    return product;
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new ValidationError(error.message);
    }
    throw error;
  }
};

/**
 * Delete a product
 * @param {string} id - The product ID
 * @returns {Promise<void>}
 */
const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  
  // Delete associated images if they exist
  if (product.images && product.images.length > 0) {
    await deleteImages(product.images);
  }
  
  await product.remove();
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
}; 