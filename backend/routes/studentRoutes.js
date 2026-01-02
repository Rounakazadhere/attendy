import express from 'express';
import bcrypt from 'bcryptjs'; // Added
import Student from '../models/Student.js';
import User from '../models/User.js'; // Added User model import
import ClassLog from '../models/ClassLog.js';
import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';
import Message from '../models/Message.js'; // Added Message Model
import sendEmail from '../utils/sendEmail.js';

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

// 0.7 GET NEXT ROLL NUMBER (Auto-Allocation)
router.get('/next-roll/:section', protect, authorize('ADMIN', 'PRINCIPAL', 'STATE_ADMIN'), async (req, res) => {
    try {
        const { section } = req.params;
        // Find student with highest roll number (assuming numeric or standard format like 1A01 if mixed)
        // Since schema has rollNumber as String, we need to be careful.
        // If format is like "1", "2", "3", we can cast.
        // If format is "1A01", we need a strategy.
        // User's previous seed used "1A01".
        // Let's regex to find the numeric part or just count + 1 for now if they want simple logic.
        // Requirement: "next roll no". 
        // Let's try to extract the max number from the string.

        const students = await Student.find({ classSection: section });
        let maxRoll = 0;

        students.forEach(s => {
            // Try to extract number from "1A05" -> 5 or "21" -> 21
            // If roll number is just digits:
            if (/^\d+$/.test(s.rollNumber)) {
                const num = parseInt(s.rollNumber);
                if (num > maxRoll) maxRoll = num;
            }
            // If roll number is like '1A05' (Class+Section+Roll), extract suffix
            else {
                // Heuristic: take last 2 digits
                const match = s.rollNumber.match(/\d+$/);
                if (match) {
                    const num = parseInt(match[0]);
                    if (num > maxRoll) maxRoll = num;
                }
            }
        });

        const nextNum = maxRoll + 1;

        // Format: [Class][Section][RollNo] (e.g., 6B03)
        // Extract Class and Section from input "6B"
        // Assuming format is Number followed by Letter(s)
        const match = section.match(/^(\d+)([A-Z]+)$/i);
        let formattedRoll = nextNum.toString();

        if (match) {
            const cls = match[1]; // "6"
            const sec = match[2]; // "B"
            // Pad number with leading zero if single digit
            const paddedNum = nextNum.toString().padStart(2, '0');
            formattedRoll = `${cls}${sec}${paddedNum}`;
        }

        res.json({ nextRoll: formattedRoll });
    } catch (err) {
        res.status(500).json({ error: "Could not calculate roll number" });
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
        const { name, rollNumber, classSection, parentPhone, parentEmail } = req.body;

        // --- 1. PRE-CHECK FOR EXISTING PARENT CONFLICTS (Optional but safer) ---
        // If we are creating a NEW parent, check if email/phone is taken by a NON-parent (or corrupted data)
        // Ideally handled by unique indexes, but catching early helps.

        // --- 2. CREATE STUDENT ---
        const newStudent = new Student({
            ...req.body,
            parentEmail: parentEmail ? parentEmail.trim() : undefined
        });
        await newStudent.save();

        // --- 3. CREATE/LINK PARENT (With Rollback) ---
        try {
            // Find ANY user with this mobile (could be Parent, Staff, etc.)
            let parentUser = await User.findOne({ mobile: parentPhone });
            let parentCredentials = null;

            if (!parentUser) {
                // CREATE NEW PARENT ACCOUNT
                const loginId = await generateParentId();
                const rawPassword = `P@${Math.floor(1000 + Math.random() * 9000)}`;
                // const hashedPassword = await bcrypt.hash(rawPassword, 10); // REMOVED: User model handles hashing

                const sanitizedParentEmail = parentEmail ? parentEmail.trim() : '';
                const parentUserEmail = sanitizedParentEmail
                    ? sanitizedParentEmail
                    : `parent.${loginId}@school.com`;

                parentUser = new User({
                    name: `Parent of ${name}`,
                    email: parentUserEmail,
                    mobile: parentPhone,
                    password: rawPassword, // Pass RAW password, pre-save hook will hash it
                    role: 'PARENT',
                    employeeId: loginId,
                    childrenIds: [newStudent._id]
                });
                await parentUser.save();
                parentCredentials = { loginId, password: rawPassword };
            } else {
                // LINK TO EXISTING PARENT
                const updatedParent = await User.findByIdAndUpdate(
                    parentUser._id,
                    { $addToSet: { childrenIds: newStudent._id } },
                    { new: true }
                );

                // Update Email if safe
                if (parentEmail) {
                    const sanitizedParentEmail = parentEmail.trim();
                    const isDummy = updatedParent.email && updatedParent.email.includes('@school.com');
                    if (!updatedParent.email || isDummy) {
                        try {
                            updatedParent.email = sanitizedParentEmail;
                            await updatedParent.save();
                        } catch (e) { console.log("Could not update parent email (duplicate?)", e.message); }
                    }
                }

                // Credentials
                if (!updatedParent.employeeId) {
                    const loginId = await generateParentId();
                    updatedParent.employeeId = loginId;
                    await updatedParent.save();
                    parentCredentials = { loginId: updatedParent.employeeId, password: "(Use Existing)" };
                } else {
                    parentCredentials = { loginId: updatedParent.employeeId, password: "(Use Existing)" };
                }
            }

            res.status(201).json({
                student: newStudent,
                parentCredentials
            });

        } catch (innerErr) {
            console.error("❌ PARENT CREATION FAILED. ROLLING BACK STUDENT.", innerErr.message);
            // ROLLBACK: Delete the student we just created so we don't have orphan/partial state
            await Student.findByIdAndDelete(newStudent._id);
            throw innerErr; // Re-throw to be caught by outer catch for response
        }

    } catch (err) {
        console.error("ADD STUDENT ERROR:", err);
        if (err.code === 11000) {
            if (err.keyPattern?.rollNumber) return res.status(400).json({ error: "Roll Number already exists in this class!" });
            if (err.keyPattern?.mobile) return res.status(400).json({ error: "Parent Phone Number is already registered!" });
            if (err.keyPattern?.email) return res.status(400).json({ error: "Parent Email is already registered!" });
            return res.status(400).json({ error: "Duplicate entry detected." });
        }
        res.status(400).json({ error: err.message });
    }
});

// 3. MARK ATTENDANCE (The Real-Time Feature) - Teachers CAN do this
router.post('/attendance', protect, authorize('ADMIN', 'STAFF', 'PRINCIPAL', 'STATE_ADMIN'), async (req, res) => {
    const { studentId, status, markedBy } = req.body;
    try {
        const normalizeStatus = (rawStatus) => {
            const s = (rawStatus || '').toString().trim().toLowerCase();
            if (s === 'present' || s === 'p') return 'Present';
            if (s === 'absent' || s === 'a') return 'Absent';
            if (s === 'late' || s === 'l') return 'Late';
            return rawStatus;
        };

        const normalizedStatus = normalizeStatus(status);
        // ... (rest of logic) ...
        // Keeping this untouched as Teachers NEED to mark attendance
        const student = await Student.findByIdAndUpdate(studentId, { status: normalizedStatus }, { new: true });
        if (!student) return res.status(404).json({ error: "Student not found" });

        const grade = student.classSection.slice(0, -1);
        const section = student.classSection.slice(-1);
        const cls = await Class.findOne({ grade, section });

        if (cls) {
            const today = new Date().toISOString().split('T')[0];
            await Attendance.findOneAndUpdate(
                { studentId, date: today },
                { classId: cls._id, status: normalizedStatus, markedBy },
                { upsert: true, new: true }
            );
        }

        if (req.io) {
            req.io.emit('attendance_update', { studentId, status });
        }

        // --- NOTIFICATION LOGIC (Email + Database Message) ---
        // Find Parent (Try linked IDs first, then phone fallback)
        let parent = await User.findOne({ childrenIds: studentId });
        if (!parent && student.parentPhone) {
            parent = await User.findOne({ mobile: student.parentPhone });
        }

        if (parent) {
            const messageContent = `Your child ${student.name} has been marked ${status} today (${new Date().toLocaleDateString()}).`;

            // 1. Create In-App Message (Always)
            await Message.create({
                senderId: req.user._id,
                receiverId: parent._id,
                studentId: student._id,
                content: messageContent,
                read: false
            });

            // 2. Send Email (Only if Email exists & status is Absent OR Late)
            if (['Absent', 'Late'].includes(normalizedStatus)) {
                const isRealEmail = (email) => {
                    const e = (email || '').toString().trim();
                    return !!e && !e.includes('@school.com');
                };

                const recipientEmail = isRealEmail(parent.email)
                    ? parent.email
                    : (isRealEmail(student.parentEmail) ? student.parentEmail : null);

                if (recipientEmail) {
                    try {
                        const subject = normalizedStatus === 'Absent'
                            ? `Attendance Alert: ${student.name} is Absent`
                            : `Attendance Update: ${student.name} is Late`;

                        await sendEmail({
                            email: recipientEmail,
                            subject: subject,
                            message: `Dear Parent,\n\n${messageContent}\n\nRegards,\nSchool Admin`
                        });
                        console.log(`📧 Email sent to ${recipientEmail} (${normalizedStatus})`);
                    } catch (emailErr) {
                        console.error('Attendance email send failed:', emailErr.message);
                    }
                }
            }
        }
        // ---------------------------------

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
router.post('/log', protect, authorize('ADMIN', 'STAFF', 'STATE_ADMIN', 'PRINCIPAL'), async (req, res) => {
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