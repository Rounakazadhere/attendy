import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import School from '../models/School.js';

const router = express.Router();

// Helper: Generate School Code (e.g., "DPS-8291")
const generateSchoolCode = (name) => {
  const prefix = name.substring(0, 3).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
};

// Helper: Generate Unique 6-Digit User ID
const generateUniqueId = async () => {
  let uniqueId;
  let isUnique = false;
  while (!isUnique) {
    uniqueId = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const existing = await User.findOne({ employeeId: uniqueId });
    if (!existing) isUnique = true;
  }
  return uniqueId;
};

// 1. REGISTER SCHOOL (Principal)
router.post('/register-school', async (req, res) => {
  try {
    const { name, email, password, schoolName, address } = req.body;

    // 0. Check Database Connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database not connected. Please Check Backend Logs & IP Whitelist.",
        error: "DB_DISCONNECTED"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // Generate Unique ID for Principal
    const employeeId = await generateUniqueId();

    const newPrincipal = new User({
      name,
      email,
      password,
      role: 'PRINCIPAL',
      employeeId, // <--- SAVED HERE
      mobile: '9999999999',
      officeLocation: { lat: 0, lng: 0 }
    });

    const savedPrincipal = await newPrincipal.save();

    // Create School
    const schoolCode = generateSchoolCode(schoolName);
    const newSchool = new School({
      name: schoolName,
      schoolCode,
      address,
      admin: savedPrincipal._id
    });

    const savedSchool = await newSchool.save();

    // Link School to Principal
    savedPrincipal.schoolId = savedSchool._id;
    await savedPrincipal.save();

    res.status(201).json({
      message: "School Registered Successfully!",
      schoolCode: savedSchool.schoolCode,
      schoolId: savedSchool._id,
      userId: employeeId // <--- RETURNED TO USER
    });

  } catch (error) {
    console.error("School Reg Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 2. JOIN SCHOOL (Teacher, Parent, Staff) - Replaces register-teacher
router.post('/join-school', async (req, res) => {
  try {
    const { name, email, password, schoolCode, role } = req.body; // Accept Role

    // 1. Validate School Code
    const school = await School.findOne({ schoolCode: schoolCode.trim() });
    if (!school) {
      return res.status(404).json({ message: "Invalid School Code. Please check with your Principal." });
    }

    // 2. Check Exisiting User
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // 3. Generate User ID
    const employeeId = await generateUniqueId();

    // 4. Create User
    const newUser = new User({
      name,
      email,
      password,
      role: role ? role.toUpperCase() : 'STAFF', // Default to STAFF
      employeeId, // <--- SAVED HERE
      schoolId: school._id,
      mobile: '0000000000',
      officeLocation: { lat: 0, lng: 0 }
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration Successful!",
      userId: employeeId // <--- RETURNED TO USER
    });

  } catch (error) {
    console.error("Join School Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Preserve Admin/Staff routes as is for now, or route them through join-school if they use codes
// Keeping them for backward compatibility if needed, but primary flow is above.
router.post('/register-admin', async (req, res) => {
  // Legacy
});


import sendEmail from '../utils/sendEmail.js';
import Otp from '../models/Otp.js';

// 3. LOGIN (Updated: ID-Based Main Flow)
router.post('/login', async (req, res) => {
  try {
    const { loginId, password, role } = req.body; // loginId instead of email, no secretCode

    // 1. Find User by ID (primary) or Email (fallback)
    let user = await User.findOne({ employeeId: loginId });
    if (!user) {
      // Fallback: Try finding by Email for legacy/admin users
      user = await User.findOne({ email: loginId });
    }

    if (!user) return res.status(404).json({ message: "User ID not found" });

    // 2. Role Check
    const claimedRole = role ? role.toUpperCase() : 'STAFF';

    // Strict Principal Check
    if (claimedRole === 'PRINCIPAL' && user.role !== 'PRINCIPAL') {
      return res.status(403).json({ message: "Access Denied: You are not a Principal." });
    }
    // Teacher Check (Allow Staff)
    if (claimedRole === 'TEACHER' && !['STAFF', 'TEACHER'].includes(user.role)) {
      return res.status(403).json({ message: "Access Denied: You are not a Teacher." });
    }
    // Parent Check 
    if (claimedRole === 'PARENT' && user.role !== 'PARENT') {
      return res.status(403).json({ message: "Access Denied: You are not a Parent." });
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    // 4. GENERATE OTP (Security Step Preserved)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({
      userId: user._id,
      email: user.email,
      otp: hashedOtp
    });

    // Send Email (Non-Blocking / Fire-and-Forget)
    if (user.email) {
      const message = `Your Login OTP is ${otp}. It expires in 5 minutes.`;

      // Do NOT await. Send in background.
      sendEmail({
        email: user.email,
        subject: 'Login OTP - School App',
        message
      }).catch(err => console.error("⚠️ Background Email Failed:", err.message));
    }

    res.json({
      message: "OTP sent to your email",
      email: user.email, // Send back email for frontend context if needed
      step: "OTP",
      debugOtp: otp
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 4. VERIFY OTP (Unchanged logic, just ensure route exists)
router.post('/verify-otp', async (req, res) => {
  // ... logic remains same as it relies on email which is passed from frontend step 1 response or state
  // Actually, Login Step 1 returns email. Frontend stores it. Step 2 sends email + otp.
  // So current verify-otp works fine.
  try {
    const { email, otp } = req.body;
    console.log(`🔍 Verify OTP Attempt: Email=${email}, OTP=${otp}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ User not found for email: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    const otpRecord = await Otp.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!otpRecord) {
      console.error(`❌ No OTP record found for user: ${user._id}`);
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    console.log(`✅ Found OTP Record. Hash: ${otpRecord.otp.substring(0, 10)}... (Comparing...)`);
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
      console.error(`❌ Hash Mismatch! Input: ${otp}`);
      return res.status(400).json({ message: "Invalid OTP" });
    }
    console.log(`✅ OTP Verified Successfully!`);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretkey_change_this_later', { expiresIn: "1h" });

    let schoolCode = null;
    if (user.schoolId) {
      const school = await School.findById(user.schoolId);
      if (school) schoolCode = school.schoolCode;
    }

    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
        schoolCode,
        email: user.email,
        assignedClass: user.assignedClass,
        childrenIds: user.childrenIds,
        employeeId: user.employeeId // Send ID back
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

import { protect } from '../middleware/auth.js';
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let schoolCode = null;
    if (user.schoolId) {
      const school = await School.findById(user.schoolId);
      if (school) schoolCode = school.schoolCode;
    }

    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
      schoolCode,
      email: user.email,
      employeeId: user.employeeId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. FORGOT PASSWORD
import crypto from 'crypto';

router.post('/forgotpassword', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Email not sent (User not found)" });

    // Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and Save to DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save();

    // Send Email
    // FRONTEND URL: http://localhost:5173/reset-password/:resetToken
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `You requested a password reset. Please go to this link to reset your password: \n\n ${resetUrl} \n\n (This link expires in 10 minutes)`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message
      });
      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. RESET PASSWORD
router.put('/resetpassword/:resetToken', async (req, res) => {
  try {
    // Build Hash from URL Token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    // Find User with Valid Token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or Expired Token" });
    }

    // Set Password
    // Set Password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, data: "Password Updated Success" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. CHANGE PASSWORD (LOGGED IN)
// 7. CHANGE PASSWORD (LOGGED IN)
// protect is already imported above


router.put('/updatepassword', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Get User (ID from protect middleware)
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify Old Password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Old Password" });
    }

    // Hash New Password & Save
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password Updated Successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;