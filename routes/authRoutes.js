const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  verifyOTP,
  resendOTP
} = require('../controllers/authController');

const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/verify', verifyOTP);
router.post('/resend', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
