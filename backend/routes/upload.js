const express = require('express');
const router = express.Router();
const { upload } = require('../services/imageService');
const { auth, adminAuth } = require('../middleware/auth');

// @route   POST /api/upload
// @desc    Upload images
// @access  Private/Admin
router.post('/', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Get the URLs for the uploaded files
    const urls = req.files.map(file => {
      return `/uploads/products/${file.filename}`;
    });

    res.status(200).json({ 
      message: 'Files uploaded successfully',
      urls: urls
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 