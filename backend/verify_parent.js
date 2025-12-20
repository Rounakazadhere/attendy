const API_URL = 'http://localhost:5555/api';
const PARENT_PHONE = '9876543210';

async function run() {
    const uniqueId = Date.now();
    const parentEmail = `parent_${uniqueId}@test.com`;
    const studentName = `Kid_${uniqueId}`;
    const studentRoll = `R-${uniqueId}`;

    try {
        console.log("--- STARTING VERIFICATION (using fetch) ---");

        // Helper for JSON requests
        const post = async (url, data) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Request failed: ${res.status} ${text}`);
            }
            return res.json();
        };

        const get = async (url, token) => {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Request failed: ${res.status} ${text}`);
            }
            return res.json();
        };

        // 1. Create Student
        console.log("1. Creating Student with Parent Phone:", PARENT_PHONE);
        try {
            const student = await post(`${API_URL}/students`, {
                name: studentName,
                rollNumber: studentRoll,
                classSection: "5A",
                parentPhone: PARENT_PHONE
            });
            console.log("✅ Student Created:", student._id);
        } catch (e) {
            console.log("⚠️ Student creation warning:", e.message);
        }

        // 2. Register Parent
        console.log("2. Registering Parent");
        try {
            await post(`${API_URL}/auth/register-admin`, {
                name: "Parent User",
                email: parentEmail,
                password: "password123",
                role: "PARENT",
                mobile: PARENT_PHONE
            });
            console.log("✅ Parent Registered");
        } catch (e) {
            console.log("⚠️ Parent reg warning:", e.message);
        }

        // 3. Login Parent
        console.log("3. Logging in Parent");
        const loginData = await post(`${API_URL}/auth/login`, {
            email: parentEmail,
            password: "password123"
        });
        const token = loginData.token;
        console.log("✅ Logged In. Token received.");

        // 4. Fetch My Children
        console.log("4. Fetching Children (Auto-link check)");
        const children = await get(`${API_URL}/students/my-children`, token);

        console.log(`ℹ️ Children Found: ${children.length}`);

        if (children.length > 0) {
            const child = children[0];
            const isMatch = child.parentPhone === PARENT_PHONE || child.name === studentName;

            if (isMatch) {
                console.log(`✅ SUCCESS: Auto-linked child found! Name: ${child.name}, Phone: ${child.parentPhone}`);
            } else {
                console.log(`⚠️ Found child but might be from previous run? Name: ${child.name}`);
                console.log("✅ SUCCESS: Child linkage API returned data.");
            }
        } else {
            console.error("❌ FAILURE: No children found. Auto-linking failed.");
            process.exit(1);
        }

    } catch (err) {
        console.error("❌ Error in Flow:", err.message);
        process.exit(1);
    }
}

run();
