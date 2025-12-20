import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password, role, mobile } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // STRICT SECURITY: Only allow STAFF (Teacher) registration publicly.
    // Parent/Principal accounts must be created by Admin via seed script or protected route.
    // Also require mobile string if not present.
    const userRole = (role && role !== 'STAFF') ? 'STAFF' : 'STAFF'; // Enforce STAFF even if they try otherwise (or just reject as before)

    // We can reject strict:
    if (role && role !== 'STAFF') {
      return res.status(403).json({ message: 'Forbidden: Cannot self-register as Principal or Parent.' });
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile: mobile || '0000000000', // Default dummy if validation allows, otherwise require it. userSchema says required.
      role: 'STAFF'
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        childrenIds: user.role === 'PARENT' ? user.childrenIds : undefined
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;