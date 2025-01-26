const User = require('../models/User');


const getAllUsers = async (req, res) => {
  try {
    // Exclude users with the 'admin' role
    const users = await User.find({ role: { $ne: 'admin' } }); // $ne is the "not equal" operator
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


const createUser = async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  try {
    const user = new User({ name, email, phone, password, role });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Failed to create user' });
  }
};



const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};


const updateUser = async (req, res) => {
  try {
    
    const user = await User.findOne({email: req.params.id})
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user' });
  }
};


const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
