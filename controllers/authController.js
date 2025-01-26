const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const Analytics = require("../models/Analytics");


// Signup
const signup = async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  try {
    const user = new User({ name, email, phone, password, role });
    await user.save();

    // Get today's date in PST (year, month, day)
    const today = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const todayDate = new Date(today).toISOString().split("T")[0];
  
      // Find today's analytics by date
    let analytics = await Analytics.findOne({
      createdAt: { $gte: new Date(todayDate), $lt: new Date(todayDate + "T23:59:59.999Z") }
    });
  
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

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed!' });
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


module.exports = { signup, login, forgotPassword, resetPassword };
