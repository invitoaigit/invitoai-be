const express = require('express');
const multer = require('multer');
const uploadToCloudinary = require('../utils/upload');

const router = express.Router();

const storage = multer.diskStorage({});
const upload = multer({ storage });


router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }


    const result = await uploadToCloudinary(req.file.path, {
      public_id: `my_uploads/${req.file.originalname.split('.')[0]}`,
    });

    res.json({
      message: 'File uploaded successfully!',
      url: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;
