import axios from 'axios';

const API_URL = 'http://localhost:5555/api/auth';

const run = async () => {
    const testEmail = `test_change_${Date.now()}@example.com`;
    const oldPass = "OldPass123";
    const newPass = "NewPass456";

    console.log("--- START: Live Password Update Test ---");

    try {
        // 1. Join School (Register)
        console.log(`1. Registering ${testEmail}...`);
        await axios.post(`${API_URL}/join-school`, {
            name: "Tester",
            email: testEmail,
            password: oldPass,
            schoolCode: "DPS-1234", // Assume valid or fail. Actually we might need a valid code.
            // Wait, join-school needs a valid code. 
            // Let's use 'register-school' first to be safe and get a code/user.
            role: "STAFF"
        }).catch(async (e) => {
            // Fallback: If code fails, try register-school (Principal)
            // But actually, we can just use register-school to create a principal and test with that.
            throw e;
        });

        // RE-PLAN: Simply register a SCHOOL to get a valid user guaranteed.
    } catch (e) {
        // Ignore, sticking to plan B below
    }

    try {
        // 1. Register a fresh Principal (Guaranteed to work)
        const principalEmail = `u_test_${Date.now()}@gmail.com`;
        console.log(`1. Creating User: ${principalEmail}`);

        const regRes = await axios.post(`${API_URL}/register-school`, {
            name: "Test Principal",
            email: principalEmail,
            password: oldPass,
            schoolName: "Test School",
            address: "Test Addr"
        });

        const userId = regRes.data.userId; // employeeId
        console.log(`   -> Created ID: ${userId}`);

        // 2. Login (Get Token)
        console.log("2. Logging in with OLD password...");
        const loginRes = await axios.post(`${API_URL}/login`, {
            loginId: userId,
            password: oldPass,
            role: "PRINCIPAL"
        });

        // Verify OTP step (Login returns step: "OTP")
        // We need to bypass OTP or verify it?
        // Wait, the login route returns { step: "OTP", debugOtp: "..." } if running in dev mode?
        // Let's check auth.js. Yes: line 192 returns 'debugOtp'.

        const otp = loginRes.data.debugOtp;
        console.log(`   -> Got OTP: ${otp}`);

        // 3. Verify OTP (Get Real Token)
        const verifyRes = await axios.post(`${API_URL}/verify-otp`, {
            email: principalEmail,
            otp: otp
        });

        const token = verifyRes.data.token;
        console.log("   -> Got JWT Token");

        // 4. Update Password
        console.log("3. Updating Password (OLD -> NEW)...");
        await axios.put(
            `${API_URL}/updatepassword`,
            { oldPassword: oldPass, newPassword: newPass },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("   -> Password Verify Success (200 OK)");

        // 5. Login with NEW Password
        console.log("4. Verifying NEW Password...");
        const newLoginRes = await axios.post(`${API_URL}/login`, {
            loginId: userId,
            password: newPass,
            role: "PRINCIPAL"
        });

        if (newLoginRes.status === 200) {
            console.log("✅ SUCCESS: Login with NEW password worked!");
        }

        // 6. Login with OLD Password (Should Fail)
        console.log("5. Verifying OLD Password (Should Fail)...");
        try {
            await axios.post(`${API_URL}/login`, {
                loginId: userId,
                password: oldPass,
                role: "PRINCIPAL"
            });
            console.error("❌ FAILURE: Old password still works!");
        } catch (e) {
            if (e.response && e.response.status === 400) {
                console.log("✅ SUCCESS: Old password rejected.");
            } else {
                console.error("❌ FAILURE: Unexpected error on old pass:", e.message);
            }
        }

    } catch (err) {
        console.error("❌ TEST FAILED - FULL ERROR:");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err);
        }
    }
};

run();
