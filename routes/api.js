const express = require('express');
const router = express.Router();

// Example API Route
router.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

module.exports = router;
