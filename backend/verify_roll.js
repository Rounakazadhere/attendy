import axios from 'axios';

async function testRoll() {
    try {
        console.log("Testing Next Roll Number Logic...");

        // 1. Need a token first (Principal)
        const loginRes = await axios.post('http://localhost:5555/api/auth/login', {
            loginId: 'PRI001',
            password: 'PRI@2025',
            role: 'PRINCIPAL'
        });

        if (loginRes.data.step === 'OTP') {
            const otp = loginRes.data.debugOtp;
            const verifyRes = await axios.post('http://localhost:5555/api/auth/verify-otp', {
                email: loginRes.data.email,
                otp: otp
            });
            const token = verifyRes.data.token;
            console.log("Got Token");

            // 2. Test Next Roll
            const section = "5A"; // Assuming 5A has students from seed
            const res = await axios.get(`http://localhost:5555/api/students/next-roll/${section}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`Next Roll for ${section}:`, res.data);
        }

    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testRoll();
