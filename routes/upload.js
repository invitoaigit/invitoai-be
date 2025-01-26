const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uniqueName = req.query.uniqueName; // Get uniqueName from query

    if (!uniqueName) {
      return cb(new Error('UniqueName is required to save the file'), null);
    }

    // Define and create directory
    const dirPath = path.join(__dirname, '..', 'invitations_data', uniqueName);
    fs.mkdirSync(dirPath, { recursive: true });
    cb(null, dirPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp
  },
});

// Configure multer
const upload = multer({ storage });

// Define upload route
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Construct the full URL
    const serverLink = process.env.SERVER_LINK; // Ensure this is set in your environment
    const filePath = path.join('invitations_data', req.query.uniqueName, req.file.filename);
    const fullUrl = `${serverLink}/${filePath.replace(/\\/g, '/')}`; // Handle Windows backslashes

    res.json({
      message: 'File uploaded successfully!',
      url: fullUrl,
    });
  } catch (error) {
    console.error('File upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
