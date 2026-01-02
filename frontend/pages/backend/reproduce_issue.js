import axios from 'axios';

const API_URL = 'http://localhost:5555/api';

async function run() {
    try {
        console.log("1. Registering New School...");
        const schoolData = {
            name: "Debug Principal",
            email: `debug.prin.${Date.now()}@test.com`,
            password: "password123",
            mobile: "1234567890",
            schoolName: "Debug School",
            address: "123 Test Lane"
        };

        let res = await axios.post(`${API_URL}/auth/register-school`, schoolData);
        console.log("   Registration Success. User ID:", res.data.userId);

        console.log("2. Logging In (Step 1)...");
        res = await axios.post(`${API_URL}/auth/login`, {
            loginId: res.data.userId,
            password: "password123",
            role: "PRINCIPAL"
        });
        const otp = res.data.debugOtp;
        console.log("   OTP Received:", otp);

        console.log("2b. Verifying OTP (Step 2)...");
        res = await axios.post(`${API_URL}/auth/verify-otp`, {
            email: schoolData.email,
            otp: otp
        });

        const token = res.data.token;
        console.log("   Login Success. Token acquired.");

        console.log("3. Adding Student...");
        const studentData = {
            name: "Test Student",
            rollNumber: Math.floor(Math.random() * 1000).toString(),
            classSection: "10A",
            parentPhone: "9876543210" // This should trigger Parent Creation
        };

        res = await axios.post(`${API_URL}/students`, studentData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("   Add Student Success!");
        console.log("   Parent Credentials:", res.data.parentCredentials);

        if (res.data.parentCredentials) {
            console.log("4. Testing Parent Login...");
            const { loginId, password } = res.data.parentCredentials;
            res = await axios.post(`${API_URL}/auth/login`, {
                loginId: loginId,
                password: password,
                role: "PARENT"
            });
            console.log("   Parent Login Initial Success (OTP Sent).");

            // Verify OTP for Parent
            const otp = res.data.debugOtp;
            res = await axios.post(`${API_URL}/auth/verify-otp`, {
                email: res.data.email,
                otp: otp
            });
            console.log("   Parent OTP Verified. Token Acquired.");
            console.log("✅ FULL FLOW VERIFIED: Principal -> Add Student -> Parent Created -> Parent Logged In");
        } else {
            console.log("⚠️ WARNING: No Parent Credentials returned. Logic check needed.");
        }

    } catch (err) {
        console.error("❌ FAILED:");
        if (err.response) {
            console.error("   Status:", err.response.status);
            console.error("   Data:", err.response.data);
        } else {
            console.error("   Error:", err.message);
        }
    }
}

run();
