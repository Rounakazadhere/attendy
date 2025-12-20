import express from 'express';
// Note: In real app, we would query StudentAttendance for historical data. 
// For now, we'll mock some trend data since we don't have historical data populated yet.
// Or we can query Attendance (Staff) which has dates.

const router = express.Router();

// 1. MONTHLY ATTENDANCE TREND (Mocked Data for Demo)
router.get('/monthly-trend', async (req, res) => {
    try {
        // Returns data for last 6 months
        // Ideally: Aggregate StudentAttendance by month

        const mockData = [
            { name: 'July', students: 85, teachers: 90 },
            { name: 'Aug', students: 82, teachers: 88 },
            { name: 'Sep', students: 88, teachers: 92 },
            { name: 'Oct', students: 78, teachers: 85 }, // Festival drop
            { name: 'Nov', students: 84, teachers: 89 },
            { name: 'Dec', students: 86, teachers: 91 },
        ];

        res.json(mockData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. DROPOUT RISK ANALYSIS
router.get('/dropout-risk', async (req, res) => {
    try {
        // Logic: Students with < 60% attendance
        // Since we track 'currentAttendancePercentage' in Student model now:
        /*
        const riskyStudents = await Student.find({ currentAttendancePercentage: { $lt: 60 } })
            .select('name classSection currentAttendancePercentage parentPhone');
        */
        // Returning mock list for now until real data flows in
        const riskyStudents = [
            { id: 1, name: "Rohan Kumar", class: "5A", attendance: 45, reason: "Health Issues" },
            { id: 2, name: "Priya Singh", class: "6B", attendance: 52, reason: "Harvest Season" },
            { id: 3, name: "Amit Raj", class: "4A", attendance: 58, reason: "Unknown" }
        ];

        res.json(riskyStudents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
