const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
// Re-import upload service for handling multipart/form-data
const { upload } = require('../services/imageService'); 
const path = require('path');
// No need for fs here as imageService handles directory creation
// const fs = require('fs'); 

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

// Create product (admin only) - Add upload.array middleware
router.post('/', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    // upload.array middleware populates req.files 
    console.log('Files received:', req.files);
    console.log('Body received:', req.body);
    
    // Extract image URLs from req.files provided by multer
    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];
    
    // Parse specifications and features if they are sent as JSON strings
    let specifications = {};
    if (req.body.specifications && typeof req.body.specifications === 'string') {
      try {
        specifications = JSON.parse(req.body.specifications);
      } catch (e) {
        console.error("Error parsing specifications JSON:", e);
        return res.status(400).json({ message: "Invalid specifications format" });
      }
    } else if (typeof req.body.specifications === 'object') {
      // Handle if already parsed (less likely with multipart/form-data but possible)
      specifications = req.body.specifications;
    }

    let features = [];
    if (req.body.features && typeof req.body.features === 'string') {
      try {
        features = JSON.parse(req.body.features);
      } catch (e) {
        console.error("Error parsing features JSON:", e);
        return res.status(400).json({ message: "Invalid features format" });
      }
    } else if (Array.isArray(req.body.features)) {
        features = req.body.features;
    }

    // Convert specifications object to Map
    const specificationsMap = new Map();
    if (specifications && typeof specifications === 'object') {
       Object.entries(specifications).forEach(([key, value]) => {
        if (value) { // Only add non-empty values
          specificationsMap.set(key, value.toString());
        }
      });
    }

    const productData = {
      ...req.body, // Get name, type, brand, model, description, price, stock
      category: req.body.type, // Set category from type
      images: images, // Add the generated image URLs
      specifications: specificationsMap, // Use the created Map
      features: features // Use parsed features array
    };
    
    console.log('Product data to save:', productData);

    const product = new Product(productData);
    await product.save();

    console.log('Product saved successfully:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    // Check for Multer errors
    if (error instanceof multer.MulterError) {
         return res.status(400).json({ message: 'File Upload Error', error: error.message });
    }
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product (admin only) - Add upload.array middleware
router.put('/:id', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Files received for update:', req.files);
    console.log('Body received for update:', req.body);

    const productData = { 
      ...req.body, // Get name, type, brand, model, description, price, stock etc.
      category: req.body.type // Set category from type
    };

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // If new files are uploaded, overwrite the images array
      // We might need logic here to merge or replace existing images based on req.body instructions
      // For now, let's assume new uploads replace old ones
      productData.images = req.files.map(file => `/uploads/products/${file.filename}`);
      // TODO: Optionally delete old images from storage if they are being replaced
    } else {
      // If no new files are uploaded, we need to check if the client wants to keep existing images
      // The frontend might send the existing image URLs back in a field like `existingImages`
      // or we might assume no change if `req.files` is empty. 
      // For simplicity now, if no files uploaded, we don't update `productData.images`,
      // relying on the client to send the full desired state or handle removal separately.
      // Let's remove the 'images' key if no new files, to avoid accidentally clearing it with $set
      // A better approach might involve sending existing URLs back from frontend.
      delete productData.images; 
    }

    // Parse specifications and features (similar to POST)
    let specifications = {};
    if (req.body.specifications && typeof req.body.specifications === 'string') {
        try { specifications = JSON.parse(req.body.specifications); } catch (e) { return res.status(400).json({ message: "Invalid specifications format" }); }
    } else if (typeof req.body.specifications === 'object') {
        specifications = req.body.specifications;
    }
    const specificationsMap = new Map();
    if (specifications && typeof specifications === 'object') {
         Object.entries(specifications).forEach(([key, value]) => {
            if (value) { specificationsMap.set(key, value.toString()); }
        });
    }
    productData.specifications = specificationsMap; // Update specifications

    let features = [];
    if (req.body.features && typeof req.body.features === 'string') {
        try { features = JSON.parse(req.body.features); } catch (e) { return res.status(400).json({ message: "Invalid features format" }); }
    } else if (Array.isArray(req.body.features)) {
        features = req.body.features;
    }
    productData.features = features; // Update features

    console.log('Product data for update:', productData);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productData }, // Use $set to update only provided fields
      { new: true, runValidators: true, context: 'query' }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
     console.error('Error updating product:', error);
     if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
     }
     if (error instanceof multer.MulterError) {
         return res.status(400).json({ message: 'File Upload Error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete associated images before deleting product document
    if (product.images && product.images.length > 0) {
      const { deleteImages } = require('../services/imageService'); // Import here or at top if preferred
      try {
          await deleteImages(product.images); 
          console.log(`Deleted images for product ${product._id}`);
      } catch (imageDeleteError) {
          console.error(`Error deleting images for product ${product._id}:`, imageDeleteError);
          // Decide if you want to proceed with product deletion even if images fail to delete
      }
    }

    // Now perform the actual delete (hard delete)
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product and associated images deleted successfully' });
  } catch (error) {
     console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router; 