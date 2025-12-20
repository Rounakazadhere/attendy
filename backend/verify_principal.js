
const API_URL = 'http://localhost:5555/api';

async function run() {
    try {
        console.log("--- PRINCIPAL DASHBOARD VERIFICATION ---");

        // Helper
        const get = async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            return res.json();
        };

        const post = async (url, data) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return res.json();
        };

        // 1. Fetch Stats Before Action
        console.log("1. Fetching Initial Stats...");
        const initialStats = await get(`${API_URL}/admin/stats`);
        console.log("Initial:", initialStats);

        // 2. Add a new Student (to increase count)
        console.log("2. Adding a new Student...");
        const uniqueId = Date.now();
        // We need a token for protected route! Let's mock or use a known one if hardcoded, 
        // OR better: Just rely on the count increasing if we ran verify_teacher.js recently.
        // For robustness, let's just create a student using the public/protected logic if we can log in.
        // Actually, let's just REGISTER A NEW TEACHER (easier, public route).

        await post(`${API_URL}/auth/register-admin`, {
            name: `Teacher_${uniqueId}`,
            email: `t_${uniqueId}@test.com`,
            password: "pass",
            role: "STAFF",
            mobile: "1234567890",
            state: "Test"
        });

        // 3. Fetch Stats Again
        console.log("3. Fetching Updated Stats...");
        const updatedStats = await get(`${API_URL}/admin/stats`);
        console.log("Updated:", updatedStats);

        // 4. Verify Teacher Count Increased
        if (updatedStats.totalTeachers > initialStats.totalTeachers) {
            console.log("✅ SUCCESS: Teacher count increased.");
        } else {
            console.error("❌ FAILURE: Teacher count did not increase.");
        }

        // 5. Verify Structure
        if (updatedStats.avgAttendance !== undefined && updatedStats.presentToday !== undefined) {
            console.log("✅ SUCCESS: Structure correct (Attendance fields present).");
        } else {
            console.error("❌ FAILURE: Missing fields.");
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

run();
