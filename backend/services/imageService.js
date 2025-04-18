const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
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
          await fs.unlink(imagePath);
        } catch (error) {
          console.error(`Error deleting image ${imagePath}:`, error);
        }
      })
    );
  } catch (error) {
    console.error('Error in deleteImages:', error);
    throw error;
  }
};

/**
 * Get the public URL for an image
 * @param {string} imagePath - The path of the image
 * @returns {string} The public URL for the image
 */
const getPublicUrl = (imagePath) => {
  const filename = path.basename(imagePath);
  return `/uploads/${filename}`;
};

module.exports = {
  upload,
  deleteImages,
  getPublicUrl
}; 