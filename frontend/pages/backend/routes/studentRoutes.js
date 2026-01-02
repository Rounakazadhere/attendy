import express from 'express';
import bcrypt from 'bcryptjs'; // Added
import Student from '../models/Student.js';
import User from '../models/User.js'; // Added User model import
import ClassLog from '../models/ClassLog.js';
import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';

const router = express.Router();
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleMiddleware.js';

// 0. GET MY CHILDREN (For Parent Dashboard)
router.get('/my-children', protect, authorize('PARENT'), async (req, res) => {
    try {
        let students = [];

        // 1. If parent has explicitly linked children IDs
        if (req.user.childrenIds && req.user.childrenIds.length > 0) {
            students = await Student.find({ _id: { $in: req.user.childrenIds } });
        }

        // 2. Auto-link logic: Find students with matching parent phone
        const linkedByPhone = await Student.find({ parentPhone: req.user.mobile });

        // Merge and deduplicate
        const allStudents = [...students, ...linkedByPhone];
        const uniqueStudents = Array.from(new Set(allStudents.map(s => s._id.toString())))
            .map(id => allStudents.find(s => s._id.toString() === id));

        res.json(uniqueStudents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 0.5 GET STUDENT ATTENDANCE HISTORY
router.get('/attendance/:studentId', protect, async (req, res) => {
    try {
        // TODO: Ensure Parent can only see THEIR child's attendance
        // For now, allowing authenticated users (Principal/Staff/Parent)
        const history = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 0.6 GET ALL STUDENTS (For Student List Page)
router.get('/', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'STATE_ADMIN', 'DISTRICT_ADMIN'), async (req, res) => {
    try {
        const students = await Student.find().sort({ classSection: 1, name: 1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. GET STUDENTS (Matches Frontend: axios.get('/api/students/5A'))
router.get('/:section', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'STATE_ADMIN', 'DISTRICT_ADMIN'), async (req, res) => {
    try {
        const students = await Student.find({ classSection: req.params.section });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. ADD STUDENT (Matches Frontend: axios.post('/api/students'))
// Helper to generate random ID
async function generateParentId() {
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    const exists = await User.findOne({ employeeId: random });
    if (exists) return generateParentId();
    return random;
}

// 2. ADD STUDENT (Matches Frontend: axios.post('/api/students'))
// 2. ADD STUDENT (Matches Frontend: axios.post('/api/students'))
router.post('/', protect, authorize('ADMIN', 'PRINCIPAL', 'STATE_ADMIN'), async (req, res) => {
    console.log("👉 ADD STUDENT REQUEST RECEIVED");
    console.log("   User:", req.user.name, "| Role:", req.user.role);
    console.log("   Body:", JSON.stringify(req.body, null, 2));

    try {
        const { name, rollNumber, classSection, parentPhone } = req.body;

        // 1. Create Student
        const newStudent = new Student(req.body);
        await newStudent.save();

        // 2. Create/Link Parent User
        let parentUser = await User.findOne({ mobile: parentPhone, role: 'PARENT' });
        let parentCredentials = null;

        if (!parentUser) {
            // CREATE NEW PARENT ACCOUNT
            const loginId = await generateParentId();
            const rawPassword = `P@${Math.floor(1000 + Math.random() * 9000)}`;
            const hashedPassword = await bcrypt.hash(rawPassword, 10);

            parentUser = new User({
                name: `Parent of ${name}`,
                email: `parent.${loginId}@school.com`, // Dummy unique email
                mobile: parentPhone,
                password: hashedPassword,
                role: 'PARENT',
                employeeId: loginId,
                childrenIds: [newStudent._id]
            });
            await parentUser.save();
            parentCredentials = { loginId, password: rawPassword };
        } else {
            // LINK TO EXISTING PARENT
            // Use $addToSet to prevent duplicates safely
            parentUser = await User.findByIdAndUpdate(
                parentUser._id,
                { $addToSet: { childrenIds: newStudent._id } },
                { new: true }
            );

            // Ensure they have an ID (migration fix)
            if (!parentUser.employeeId) {
                const loginId = await generateParentId();
                parentUser.employeeId = loginId;
                await parentUser.save();
                parentCredentials = { loginId: parentUser.employeeId, password: "(Use Existing)" };
            } else {
                parentCredentials = { loginId: parentUser.employeeId, password: "(Use Existing)" };
            }
        }

        res.status(201).json({
            student: newStudent,
            parentCredentials
        });
    } catch (err) {
        console.error("ADD STUDENT ERROR:", err); // Log to terminal
        if (err.code === 11000) {
            return res.status(400).json({ error: "Roll Number already exists in this class!" });
        }
        res.status(400).json({ error: err.message });
    }
});

// 3. MARK ATTENDANCE (The Real-Time Feature) - Teachers CAN do this
router.post('/attendance', protect, authorize('ADMIN', 'STAFF', 'PRINCIPAL', 'STATE_ADMIN'), async (req, res) => {
    const { studentId, status, markedBy } = req.body;
    try {
        // ... (rest of logic) ...
        // Keeping this untouched as Teachers NEED to mark attendance
        const student = await Student.findByIdAndUpdate(studentId, { status: status }, { new: true });
        if (!student) return res.status(404).json({ error: "Student not found" });

        const grade = student.classSection.slice(0, -1);
        const section = student.classSection.slice(-1);
        const cls = await Class.findOne({ grade, section });

        if (cls) {
            const today = new Date().toISOString().split('T')[0];
            await Attendance.findOneAndUpdate(
                { studentId, date: today },
                { classId: cls._id, status, markedBy },
                { upsert: true, new: true }
            );
        }

        if (req.io) {
            req.io.emit('attendance_update', { studentId, status });
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 3.5 GET SINGLE STUDENT
router.get('/details/:id', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'STATE_ADMIN'), async (req, res) => {
    // Staff can view details (e.g. parent info)
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: "Student not found" });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3.6 UPDATE STUDENT
router.put('/:id', protect, authorize('ADMIN', 'PRINCIPAL', 'STATE_ADMIN'), async (req, res) => { // Removed STAFF (Teachers can't edit student profiles)
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!student) return res.status(404).json({ error: "Student not found" });
        res.json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. DELETE STUDENT
router.delete('/:id', protect, authorize('ADMIN', 'PRINCIPAL', 'STATE_ADMIN'), async (req, res) => { // Removed STAFF
    try {
        await Student.findByIdAndDelete(req.params.id);

        // Notify Dashboard to lower the "Total Students" count instantly
        if (req.io) {
            req.io.emit('student_deleted', { studentId: req.params.id });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. ADD CLASS LOG (What taught today)
router.post('/log', protect, authorize('ADMIN', 'STAFF', 'STATE_ADMIN'), async (req, res) => {
    try {
        const { teacherId, classSection, subject, topic, date } = req.body;

        // Upsert: If a log exists for this teacher/class/date/subject, update it. Otherwise create new.
        // This prevents duplicates if they correct a typo.
        const log = await ClassLog.findOneAndUpdate(
            { teacherId, classSection, date, subject },
            { topic },
            { new: true, upsert: true } // Upsert = Update or Insert
        );

        res.status(201).json(log);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 6. GET CLASS LOG (For a specific section today)
router.get('/log/:section', protect, authorize('ADMIN', 'PRINCIPAL', 'STAFF', 'STATE_ADMIN', 'DISTRICT_ADMIN'), async (req, res) => {
    try {
        const date = new Date().toISOString().split('T')[0];
        const logs = await ClassLog.find({
            classSection: req.params.section,
            date: date
        }).populate('teacherId', 'name');

        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;