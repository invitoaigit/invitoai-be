const express = require('express');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// Define routes
router.get('/', getAllUsers); // GET all users
router.post('/', createUser); // POST a new user
router.get('/:id', getUserById); // GET a user by ID
router.put('/:id', updateUser); // UPDATE a user by ID
router.delete('/:id', deleteUser); // DELETE a user by ID

module.exports = router;
