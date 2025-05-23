const Template = require('../models/Template'); 
const fs = require('fs');
const path = require('path');
// Get all templates
exports.getAllTemplates = async (req, res) => {
    try {
        const templates = await Template.find();
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single template by ID
exports.getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) return res.status(404).json({ message: "Template not found" });
        res.status(200).json(template);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new template
exports.createTemplate = async (req, res) => {
    try {
        const { name, image, category, price, discount, currency, youtubeLink, templateData, description, type } = req.body;
        const newTemplate = new Template({ name, image, category, currency, youtubeLink, price, discount, templateData, description, type });
        const savedTemplate = await newTemplate.save();
        res.status(201).json(savedTemplate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a template by ID
exports.updateTemplate = async (req, res) => {
    try {
        const updatedTemplate = await Template.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedTemplate) return res.status(404).json({ message: "Template not found" });
        res.status(200).json(updatedTemplate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteTemplate = async (req, res) => {
    try {
      const deletedTemplate = await Template.findByIdAndDelete(req.params.id);
  
      if (!deletedTemplate)
        return res.status(404).json({ message: "Template not found" });
  

      const folderName = deletedTemplate.name.replace(/\s+/g, '');
      const folderPath = path.join(__dirname, '..', 'templates_data', folderName);
  

      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Deleted folder: ${folderPath}`);
      } else {
        console.warn(`Folder not found: ${folderPath}`);
      }
  
      res.status(200).json({ message: "Template and folder deleted successfully" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: error.message });
    }
  };
