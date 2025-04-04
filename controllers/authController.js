const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const Analytics = require("../models/Analytics");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user || !user.emailOTP || !user.emailExpires) {
          return res.status(400).json({ error: 'Invalid OTP or user not found' });
      }

      const currentTime = new Date();
      if (currentTime > user.emailExpires) {
          return res.status(400).json({ error: 'OTP expired' });
      }

      if (user.emailOTP !== otp) {
          return res.status(400).json({ error: 'Invalid OTP' });
      }

      user.emailOTP = null;
      user.emailExpires = null;
      user.verified = true;
      await user.save();

      res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error verifying OTP' });
  }
};
// Signup
const signup = async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  try {
    const duplicate = await User.findOne({ email });
    if (duplicate) {
      return res.status(401).json({ error: 'Email Is already registered!' });
    }
    const user = new User({ name, email, phone, password, role });
    await user.save();

    const otp = generateOTP();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 30);
    // Get today's date in PST (year, month, day)
    const today = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const todayDate = new Date(today).toISOString().split("T")[0];
  
      // Find today's analytics by date
    let analytics = await Analytics.findOne({
      createdAt: { $gte: new Date(todayDate), $lt: new Date(todayDate + "T23:59:59.999Z") }
    });
  
    await sendEmail(email, 'Email Verification', `This code will expire in 30 minutes. OTP: ${otp}`);

    user.emailOTP = otp;
    user.emailExpires = expiry;
    await user.save();

    if (!analytics) {
      // Create a new analytics record if it doesn't exist
      analytics = new Analytics({ userCount: 1 });
      await analytics.save();
    } else {
      analytics.userCount += 1;
      await analytics.save();
    }
  

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: 'Error registering user!' });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, invitationsLimit: user.invitationsLimit, verified: user.verified }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } 
    );
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({ token, refreshToken });
  } catch (error) {
    res.status(500).json({ error: 'Login failed!' });
  }
};
const refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ error: 'Refresh token required!' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user in DB
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ error: 'Invalid refresh token!' });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, invitationsLimit: user.invitationsLimit },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: 'Expired Login! Please login again!' });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; 
    await user.save();

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const resetUrl = `${baseUrl}/reset-password/${token}`;
    await sendEmail(email, 'Password Reset', `This link will expire in 15 minutes. Reset your password here: ${resetUrl}`);
    res.status(200).json({ message: 'Password reset email sent!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to send reset email!' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.resetPasswordToken !== token || Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ error: 'Invalid or expired token!' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please request a new password reset.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to reset password!' });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const otp = generateOTP();
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 30);

      await sendEmail(email, 'Resend OTP', `This code will expire in 30 minutes. OTP: ${otp}`);

      user.emailOTP = otp;
      user.emailExpires = expiry;
      await user.save();

      res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error resending OTP' });
  }
};


module.exports = { signup, login, forgotPassword, resetPassword, refreshToken, verifyOTP, resendOTP };
