import express from 'express';
import multer from 'multer';
import path from 'path';
import TeacherAttendance from '../models/TeacherAttendance.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// --- MULTER SETUP (Image Upload) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save images to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Helper: Calculate Distance (Haversine Formula) in Meters
// Returns distance in meters between two lat/lng points
const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d * 1000; // Meters
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

// 1. MARK ATTENDANCE (Check-In)
// Expects: userId, lat, lng, date (photo is now optional)
router.post('/check-in', protect, authorize('STAFF', 'PRINCIPAL', 'STATE_ADMIN'), upload.single('photo'), async (req, res) => {
  try {
    const { userId, lat, lng, date } = req.body;
    // ensure user marks their OWN attendance unless admin override (omitted for now)
    if (userId !== req.user.id && req.user.role !== 'STATE_ADMIN') {
      return res.status(403).json({ message: "Cannot mark attendance for others." });
    }

    const photoPath = req.file ? req.file.path : null; // Photo is optional now

    console.log(`📍 Check-In Attempt: User ${userId} at [${lat}, ${lng}]`);

    // 0. Fetch User to get Assigned Office Location
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Geo-Fencing Check (REAL Check)
    if (user.officeLocation && user.officeLocation.lat && user.officeLocation.lng) {
      const { lat: officeLat, lng: officeLng, radius } = user.officeLocation;

      const distance = getDistanceFromLatLonInM(lat, lng, officeLat, officeLng);
      console.log(`📏 Distance from Office: ${distance.toFixed(2)} meters (Allowed: ${radius}m)`);

      if (distance > radius) {
        return res.status(403).json({
          message: `❌ You are ${distance.toFixed(0)}m away from office! (Max allowed: ${radius}m). Please reach office location.`
        });
      }
    } else {
      console.log("⚠️ No Office Location set for this user. Skipping Geo-Fence check.");
    }

    // 2. Check for Duplicate Entry
    const existing = await TeacherAttendance.findOne({ userId, date });
    if (existing) {
      return res.status(400).json({ message: "Attendance already marked for today!" });
    }

    // 3. Save Record (photo is optional)
    const newRecord = new TeacherAttendance({
      userId,
      date,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      photoUrl: photoPath || null, // Can be null
      status: 'PRESENT'
    });

    await newRecord.save();

    // Live Update (Socket.io)
    if (req.io) {
      req.io.emit('staff_update', { userId, status: 'PRESENT' });
    }

    res.status(201).json({ message: "Attendance Marked Successfully!", record: newRecord });

  } catch (error) {
    console.error("Attendance Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 2. GET HISTORY (For Admin/User)
router.get('/history/:userId', protect, async (req, res) => {
  try {
    // Allow user to see own history OR admin/principal to see any
    if (req.params.userId !== req.user.id) {
      // Check if requester is Principal or Admin
      if (!['PRINCIPAL', 'STATE_ADMIN', 'DISTRICT_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ message: "Unauthorized to view this history" });
      }
    }

    const history = await TeacherAttendance.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET TODAY'S STATS (Admin Dashboard)
router.get('/stats/today', protect, authorize('PRINCIPAL', 'STATE_ADMIN', 'DISTRICT_ADMIN'), async (req, res) => {
  try {
    // Need to find 'today' string format that matches saving format
    // Ideally frontend sends date, but here is a simple fallback
    const todaySearch = new RegExp(new Date().toISOString().split('T')[0]);

    const presentCount = await TeacherAttendance.countDocuments({ date: { $regex: todaySearch } });
    const totalStaff = await User.countDocuments({ role: 'STAFF' });

    res.json({
      totalStaff,
      present: presentCount,
      absent: totalStaff - presentCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DOWNLOAD CSV REPORT (Admin Feature)
router.get('/reports/download', protect, authorize('PRINCIPAL', 'STATE_ADMIN', 'DISTRICT_ADMIN'), async (req, res) => {
  try {
    // Fetch all attendance records, sorted by date (newest first)
    // Populate 'userId' to get the Staff Name & Employee ID
    const records = await TeacherAttendance.find().sort({ createdAt: -1 }).populate('userId', 'name employeeId role district block');

    // Define CSV Headers
    let csv = "Date,Staff Name,Role,Employee ID,Status,Check-In Time,Location (Lat/Lng),District,Block\n";

    // Loop and Append Rows
    records.forEach(record => {
      // Safety check if user was deleted but record exists
      const userName = record.userId ? record.userId.name : "Unknown User";
      const userRole = record.userId ? record.userId.role : "N/A";
      const empId = record.userId ? record.userId.employeeId || "N/A" : "N/A";
      const district = record.userId ? record.userId.district || "-" : "-";
      const block = record.userId ? record.userId.block || "-" : "-";

      // Format Date & Time
      const dateStr = new Date(record.date).toLocaleDateString();
      const timeStr = new Date(record.createdAt).toLocaleTimeString();
      const locStr = `${record.location.lat}, ${record.location.lng}`;

      // Append Line
      csv += `${dateStr},${userName},${userRole},${empId},${record.status},${timeStr},"${locStr}",${district},${block}\n`;
    });

    // Set Headers for Download
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="attendance_report.csv"');
    res.send(csv);

  } catch (err) {
    console.error("CSV Gen Error:", err);
    res.status(500).send("Error generating report");
  }
});

export default router;
