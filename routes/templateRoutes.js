const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController'); // Update the path as per your folder structure

// Routes
router.get('/', templateController.getAllTemplates);             // Get all templates
router.get('/:id', templateController.getTemplateById);          // Get a single template by ID
router.post('/', templateController.createTemplate);             // Create a new template
router.put('/:id', templateController.updateTemplate);           // Update a template by ID
router.delete('/:id', templateController.deleteTemplate);        // Delete a template by ID

module.exports = router;