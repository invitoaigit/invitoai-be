const cloudinary = require('../config/cloudinaryConfig');

const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, options);
    console.log('✅ Upload Successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Upload Failed:', error);
    throw error;
  }
};

module.exports = uploadToCloudinary;
