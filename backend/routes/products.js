const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all products with filtering
router.get('/', async (req, res) => {
  try {
    const { type, brand, kvaRating, search } = req.query;
    let query = { isActive: true };

    if (type) query.type = type;
    if (brand) query.brand = brand;
    if (kvaRating) query.kvaRating = kvaRating;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Create product (admin only)
router.post('/', adminAuth, upload.single('images'), async (req, res) => {
  try {
    console.log('File upload info:', req.file);
    console.log('Request body:', req.body);
    
    // If a file was uploaded, check if it exists in the uploads directory
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      console.log('Checking if file exists at:', filePath);
      if (fs.existsSync(filePath)) {
        console.log('File exists at:', filePath);
        console.log('File size:', fs.statSync(filePath).size);
      } else {
        console.log('File does not exist at:', filePath);
      }
    }
    
    const productData = {
      ...req.body,
      category: req.body.type,
      imageURL: req.file ? `/uploads/${req.file.filename}` : null
    };

    // Parse specifications if it's a string
    if (typeof productData.specifications === 'string') {
      try {
        productData.specifications = JSON.parse(productData.specifications);
      } catch (error) {
        console.error('Error parsing specifications:', error);
        productData.specifications = {};
      }
    }

    // Convert specifications object to Map
    if (productData.specifications && typeof productData.specifications === 'object') {
      const specificationsMap = new Map();
      Object.entries(productData.specifications).forEach(([key, value]) => {
        if (value) { // Only add non-empty values
          specificationsMap.set(key, value.toString());
        }
      });
      productData.specifications = specificationsMap;
    }
    
    console.log('Product data to save:', productData);

    const product = new Product(productData);
    await product.save();

    console.log('Product saved successfully:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', adminAuth, upload.single('images'), async (req, res) => {
  try {
    const productData = { 
      ...req.body,
      category: req.body.type // Use type as category
    };
    
    if (req.file) {
      productData.imageURL = `/uploads/${req.file.filename}`;
    }

    // Parse specifications if it's a string
    if (typeof productData.specifications === 'string') {
      try {
        productData.specifications = JSON.parse(productData.specifications);
      } catch (error) {
        console.error('Error parsing specifications:', error);
        productData.specifications = {};
      }
    }

    // Convert specifications object to Map
    if (productData.specifications && typeof productData.specifications === 'object') {
      const specificationsMap = new Map();
      Object.entries(productData.specifications).forEach(([key, value]) => {
        if (value) { // Only add non-empty values
          specificationsMap.set(key, value.toString());
        }
      });
      productData.specifications = specificationsMap;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router; 