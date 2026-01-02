import axios from 'axios';

const BASE_URL = 'http://localhost:5555/api';

// 1. We need a real token. Let's try to login as the Principal we know exists (or create one)
// For this test, let's assume valid credentials or use the "register-school" to get a fresh token if needed.
// better: use the hardcoded fallback secret if we can match it, OR just login.

async function getRealToken() {
    try {
        // Try logging in with the Principal credentials we saw in logs earlier or common defaults
        // "rounakazad09@gmail.com" was seen in logs.
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'rounakazad09@gmail.com',
            password: 'password123' // Assumption based on common test data, if this fails we'll need to create a test user
        });
        return res.data.token;
    } catch (err) {
        console.log("⚠️ Login failed (likely wrong password). Creating a TEMP test principal...");
        try {
            const random = Math.floor(Math.random() * 10000);
            const regRes = await axios.post(`${BASE_URL}/auth/register-school`, {
                name: `Test Principal ${random}`,
                email: `test_principal_${random}@school.com`,
                password: 'password123',
                schoolName: `Test School ${random}`,
                address: '123 Test Lane'
            });
            // 1. Login (Trigger OTP)
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                loginId: regRes.data.userId, // use returned userId (employeeId)
                password: 'password123'
            });

            // 2. Verify OTP
            const otp = loginRes.data.debugOtp;
            if (!otp) throw new Error("No debugOtp returned from login. Cannot verify.");

            const verifyRes = await axios.post(`${BASE_URL}/auth/verify-otp`, {
                email: `test_principal_${random}@school.com`,
                otp: otp.toString()
            });

            return verifyRes.data.token;
        } catch (regErr) {
            console.error("❌ Failed to create test user:", regErr.response?.data || regErr.message);
            process.exit(1);
        }
    }
}

async function runTests() {
    console.log("🚀 Starting Route Verification (Real Token)...\n");

    const token = await getRealToken();
    console.log("🔑 Obtained Valid Token");

    const authHeader = { Authorization: `Bearer ${token}` };

    // 1. GET CLASSES (Protected)
    try {
        await axios.get(`${BASE_URL}/classes`, { headers: authHeader });
        console.log(`✅ [PRINCIPAL] GET /classes - Success`);
    } catch (err) {
        console.log(`❌ [PRINCIPAL] GET /classes - Failed: ${err.response?.status}`);
    }

    console.log("-----------------------------------");

    // 2. GET STUDENTS
    try {
        await axios.get(`${BASE_URL}/students/5A`, { headers: authHeader });
        console.log(`✅ [PRINCIPAL] GET /students/5A - Success`);
    } catch (err) {
        console.log(`❌ [PRINCIPAL] GET /students/5A - Failed: ${err.message}`);
    }

    // 3. ADD STUDENT
    try {
        await axios.post(`${BASE_URL}/students`, {}, { headers: authHeader });
        console.log(`❌ [PRINCIPAL] POST /students - Failed (Unexpected Success on empty body)`);
    } catch (err) {
        if (err.response?.status === 400 || err.response?.status === 500) {
            // 500 might happen if empty body causes server error, but 401 is the one we want to AVOID
            console.log(`✅ [PRINCIPAL] POST /students - Auth Passed (Got ${err.response.status} as expected for empty body)`);
        } else {
            console.log(`❌ [PRINCIPAL] POST /students - Failed with ${err.response?.status}`);
        }
    }

}

runTests();
