
const API_URL = 'http://localhost:5555/api';

async function run() {
    console.log("--- PLANS SYSTEM VERIFICATION ---");

    // Helpers
    const post = async (url, body, token) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`POST ${url} failed: ${res.status} ${txt}`);
        }
        return res.json();
    };

    const get = async (url, token) => {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
        return res.json();
    };

    const patch = async (url, body, token) => {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`PATCH ${url} failed: ${res.status}`);
        return res.json();
    };

    try {
        // 1. Login
        console.log("1. Authenticating Teacher...");
        const loginRes = await post(`${API_URL}/auth/login`, { email: 'teacher@test.com', password: 'password123' });
        const token = loginRes.token;
        console.log("   Logged in. Role:", loginRes.user.role);

        // 2. Create Task
        console.log("2. Creating Task...");
        const newTask = await post(`${API_URL}/tasks`, {
            title: 'Backend Verification Task',
            description: 'Testing via script',
            category: 'General',
            assignedToRole: 'STAFF', // Using the correct backend role
            priority: 'High'
        }, token);
        console.log("   Task Created. ID:", newTask._id);

        // 3. Fetch Tasks
        console.log("3. Fetching Tasks...");
        const tasks = await get(`${API_URL}/tasks`, token);
        const found = tasks.find(t => t._id === newTask._id);

        if (found) {
            console.log("✅ Task found in list.");
        } else {
            console.error("❌ Task NOT found in list. Tasks returned:", tasks.length);
            tasks.forEach(t => console.log(`   - ${t.title} (${t.assignedToRole})`));
        }

        // 4. Toggle Status
        console.log("4. Toggling Task Status...");
        const toggled = await patch(`${API_URL}/tasks/${newTask._id}/toggle`, {}, token);
        if (toggled.completed) {
            console.log("✅ Task marked as completed.");
        } else {
            console.error("❌ Task toggle failed.");
        }

        // 5. Get Details
        console.log("5. Fetching Task Details...");
        const details = await get(`${API_URL}/tasks/${newTask._id}`, token);
        if (details.title === 'Backend Verification Task') {
            console.log("✅ Task details fetched successfully.");
        } else {
            console.error("❌ Task details mismatch.");
        }

    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

run();
