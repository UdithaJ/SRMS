import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, userName, referenceNo, password } = req.body;

    // Check if userName exists
    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({ message: 'User Name is already taken' });
    }

    // Check if referenceNo exists
    const existingRef = await User.findOne({ referenceNo });
    if (existingRef) {
      return res.status(400).json({ message: 'Reference number already exists' });
    }

    const newUser = new User({ firstName, lastName, userName, referenceNo, password });
    await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Find user by userName
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(400).json({ message: 'Invalid user name or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid user name or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        referenceNo: user.referenceNo,
        userRole: user.userRole
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user by ID
router.put('/users/:id', async (req, res) => {
  try {
    const { firstName, lastName, userName, userRole, section, referenceNo, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if new userName is already taken by another user
    if (userName && userName !== user.userName) {
      const existingUserName = await User.findOne({ userName });
      if (existingUserName) {
        return res.status(400).json({ message: 'User Name is already taken' });
      }
      user.userName = userName;
    }

    // Check if new referenceNo is already taken by another user
    if (referenceNo && referenceNo !== user.referenceNo) {
      const existingRef = await User.findOne({ referenceNo });
      if (existingRef) {
        return res.status(400).json({ message: 'Reference number already exists' });
      }
      user.referenceNo = referenceNo;
    }

    if (firstName) user.firstName = firstName;
    if (userRole) user.userRole = userRole;
    if (section) user.section = section;
    if (lastName) user.lastName = lastName;
    if (password) user.password = password; // pre-save hook will hash it

    await user.save();
    res.json({ message: 'User updated successfully', user: user.toObject({ getters: true, versionKey: false }) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
