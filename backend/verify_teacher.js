const API_URL = 'http://localhost:5555/api';
// Use the teacher details we can register or assume exists.
// Let's Register a new teacher to be sure.

async function run() {
    const uniqueId = Date.now();
    const teacherEmail = `teacher_${uniqueId}@test.com`;
    const password = "password123";

    try {
        console.log("--- TEACHER DASHBOARD VERIFICATION ---");

        // Helper for JSON requests
        const post = async (url, data, token = null) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Request failed: ${res.status} ${text}`);
            }
            return res.json();
        };

        const get = async (url, token = null) => {
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, { headers });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Request failed: ${res.status} ${text}`);
            }
            return res.json();
        };

        // 1. Register Teacher (using register-staff or admin for simplicity if staff needs school code)
        // Let's use register-admin with role STAFF for simplicity in this test script
        console.log("1. Registering Teacher...");
        const teacher = await post(`${API_URL}/auth/register-admin`, {
            name: "Test Teacher",
            email: teacherEmail,
            password: password,
            role: "STAFF",
            mobile: "1111111111",
            state: "TestState"
        });
        console.log("✅ Teacher Registered");

        // 2. Login
        console.log("2. Logging in...");
        const login = await post(`${API_URL}/auth/login`, { email: teacherEmail, password: password });
        const token = login.token;
        const teacherId = login.user.id || login.user._id;
        console.log("✅ Logged In. ID:", teacherId);

        // 3. Create a Dummy Student in 5A (Needs to be in same class teacher manages? defaults to 5A)
        // Note: Protected route now!
        console.log("3. Creating Student (Secure)...");
        const student = await post(`${API_URL}/students`, {
            name: `Student_${uniqueId}`,
            rollNumber: `R-${uniqueId}`,
            classSection: "5A",
            parentPhone: "9998887776"
        }, token);
        console.log("✅ Student Created:", student._id);

        // 4. Mark Attendance (Secure)
        console.log("4. Marking Attendance (Secure)...");
        await post(`${API_URL}/students/attendance`, {
            studentId: student._id,
            status: "Absent",
            markedBy: teacherId
        }, token);
        console.log("✅ Attendance Marked as Absent");

        // 5. Save Class Log (Secure)
        console.log("5. Saving Class Log (Secure)...");
        const log = await post(`${API_URL}/students/log`, {
            teacherId: teacherId,
            classSection: "5A",
            subject: "Maths",
            topic: "Calculus Intro",
            date: new Date().toISOString().split('T')[0]
        }, token);
        console.log("✅ Class Log Saved:", log.topic);

        // 6. Verify Log in "Recent Logs" (Public or Secured GET)
        console.log("6. Verifying Log Retrieval...");
        const logs = await get(`${API_URL}/students/log/5A`); // GET is public currently
        const savedLog = logs.find(l => l.topic === "Calculus Intro");

        if (savedLog) {
            console.log("✅ SUCCESS: Log found in fetch.");
        } else {
            console.error("❌ FAILURE: Log not found.");
            process.exit(1);
        }

    } catch (err) {
        console.error("❌ Error in Flow:", err.message);
        process.exit(1);
    }
}

run();
