const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
const register = async (req, res) => {
  try {
    const { name, fullName, email, password, role } = req.body;
    const normalizedName = name || fullName;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: req.user?.role === 'admin' ? (role || 'employee') : 'employee',
      joiningDate: new Date(),
      leaveBalance: 20
    });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        email: user.email,
        role: user.role,
        leaveBalance: user.leaveBalance,
        joiningDate: user.joiningDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    
    let user = await User.findOne({ email: normalizedEmail });

    // Demo recovery path: ensure default admin account always works.
    if (normalizedEmail === 'admin@example.com' && password === 'admin123') {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      if (!user) {
        user = await User.create({
          name: 'Admin User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin',
          joiningDate: new Date(),
          leaveBalance: 0
        });
      } else {
        user.name = user.name || 'Admin User';
        user.password = hashedPassword;
        user.role = 'admin';
        await user.save();
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    let isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid && user.password === password) {
      // Backward compatibility for legacy plain-text seeded passwords.
      isPasswordValid = true;
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Demo safeguard: keep seeded admin account role consistent.
    if (normalizedEmail === 'admin@example.com' && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        email: user.email,
        role: user.role,
        leaveBalance: user.leaveBalance,
        joiningDate: user.joiningDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile };