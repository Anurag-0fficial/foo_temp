const multer = require('multer');
const path = require('path');
const fsPromises = require('fs').promises; // Use promises for async operations like delete
const fs = require('fs'); // Use standard fs for sync operations needed by multer config

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    // Create directory if it doesn't exist (use standard fs sync methods)
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
      } catch (err) {
        console.error('Error creating upload directory:', err);
        return cb(err); // Pass error to multer
      }
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

/**
 * Delete multiple images from the filesystem
 * @param {string[]} imagePaths - Array of image paths to delete
 * @returns {Promise<void>}
 */
const deleteImages = async (imagePaths) => {
  try {
    await Promise.all(
      imagePaths.map(async (imagePath) => {
        try {
          const fullPath = path.join(__dirname, '../../uploads/products', path.basename(imagePath));
          // Use fsPromises for async unlink
          await fsPromises.unlink(fullPath);
        } catch (error) {
          // Log specific file deletion errors but don't necessarily stop others
          if (error.code !== 'ENOENT') { // Ignore error if file doesn't exist
            console.error(`Error deleting image ${imagePath}:`, error);
          }
        }
      })
    );
  } catch (error) {
    // Catch potential errors from Promise.all itself
    console.error('Error in deleteImages:', error);
    throw error; // Re-throw error if needed by caller
  }
};

/**
 * Get the public URL for an image
 * @param {string} imagePath - The path of the image
 * @returns {string} The public URL for the image
 */
const getPublicUrl = (imagePath) => {
  const filename = path.basename(imagePath);
  return `/uploads/products/${filename}`;
};

module.exports = {
  upload,
  deleteImages,
  getPublicUrl
}; 