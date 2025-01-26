const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');

// Create a new invitation
router.post('/', invitationController.createInvitation);

// Get all invitations
router.get('/', invitationController.getInvitations);

// Get a specific invitation by uniqueName
router.get('/:uniqueName', invitationController.getInvitationByUniqueName);

// Update a specific invitation by uniqueName
router.put('/:uniqueName', invitationController.updateInvitation);

// Delete a specific invitation by uniqueName
router.delete('/:uniqueName', invitationController.deleteInvitation);

// Get invitations by user
router.get('/user/:user', invitationController.getInvitationsByUser);

module.exports = router;
