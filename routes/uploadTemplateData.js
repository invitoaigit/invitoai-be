const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const templateName = req.query.templateName;

    if (!templateName) {
      return cb(new Error('TemplateName is required to save the files'), null);
    }

    // Define and create directory
    const dirPath = path.join(__dirname, '..', 'templates_data', templateName);
    fs.mkdirSync(dirPath, { recursive: true });
    cb(null, dirPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  },
});

const upload = multer({ storage });

router.post('/upload', upload.array('files', 30), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const serverLink = process.env.SERVER_LINK;
    const templateName = req.query.templateName;

    // Generate URLs for all uploaded files
    const fileUrls = req.files.map(file => {
      const filePath = path.join('templates_data', templateName, file.originalname);
      return `${serverLink}/${filePath.replace(/\\/g, '/')}`
    });

    res.json({
      message: 'Files uploaded successfully!',
      urls: fileUrls,
    });
  } catch (error) {
    console.error('File upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/files', async (req, res) => {
  try {
    const templateName = req.query.templateName;

    if (!templateName) {
      return res.status(400).json({ error: 'TemplateName is required' });
    }

    const dirPath = path.join(__dirname, '..', 'templates_data', templateName);

    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const files = fs.readdirSync(dirPath);

    if (files.length === 0) {
      return res.status(200).json({ message: 'No files found', files: [] });
    }

    const serverLink = process.env.SERVER_LINK; 

    // Generate file URLs
    const fileUrls = files.map(file => ({
      name: file,
      url: `${serverLink}/templates_data/${templateName}/${file}`.replace(/\\/g, '/'),
    }));

    res.json({ message: 'Files retrieved successfully!', files: fileUrls });
  } catch (error) {
    console.error('Error retrieving files:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.put('/update', async (req, res) => {
  try {
    const templateName = req.query.templateName;
    const receivedFiles = req.body.files; 

    if (!templateName) {
      return res.status(400).json({ error: 'TemplateName is required' });
    }
    if (!Array.isArray(receivedFiles)) {
      return res.status(400).json({ error: 'Files array is required' });
    }

    const dirPath = path.join(__dirname, '..', 'templates_data', templateName);

    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const existingFiles = fs.readdirSync(dirPath);
    const receivedFileNames = receivedFiles.map(file => file.name);

    existingFiles.forEach(file => {
      if (!receivedFileNames.includes(file)) {
        fs.unlinkSync(path.join(dirPath, file));
      }
    });


    const updatedFiles = fs.readdirSync(dirPath).map(file => ({
      name: file,
      url: `${process.env.SERVER_LINK}/templates_data/${templateName}/${file}`.replace(/\\/g, '/')
    }));

    res.json({ message: 'Files updated successfully!', files: updatedFiles });
  } catch (error) {
    console.error('Error updating files:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
