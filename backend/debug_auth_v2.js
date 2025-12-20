import axios from 'axios';

const API_URL = 'http://localhost:5555/api/auth';

async function testAuth() {
    console.log("🚀 Starting Auth V2 Debug Test...");

    try {
        // 1. Register School
        console.log("\n1. Testing Register School...");
        const schoolName = "Debug High " + Math.floor(Math.random() * 1000);
        const uniqueEmail = "principal" + Math.floor(Math.random() * 10000) + "@debug.com";

        const schoolPayload = {
            name: "Principal Debug",
            email: uniqueEmail,
            password: "password123",
            schoolName: schoolName,
            address: "123 Debug Lane"
        };

        const schoolRes = await axios.post(`${API_URL}/register-school`, schoolPayload);
        console.log("✅ School Registered!");
        console.log("   School Code:", schoolRes.data.schoolCode);
        console.log("   Principal ID:", schoolRes.data.userId);

        const SCHOOL_CODE = schoolRes.data.schoolCode;

        // 2. Join School as Teacher
        console.log("\n2. Testing Join School (Teacher)...");
        const teacherEmail = "teacher" + Math.floor(Math.random() * 10000) + "@debug.com";
        const teacherPayload = {
            name: "Teacher Debug",
            email: teacherEmail,
            password: "password123",
            schoolCode: SCHOOL_CODE,
            role: "STAFF"
        };

        const teacherRes = await axios.post(`${API_URL}/join-school`, teacherPayload);
        console.log("✅ Teacher Joined!");
        console.log("   Teacher ID:", teacherRes.data.userId);

        // 3. Join School as Principal (User Request)
        console.log("\n3. Testing Join School (Principal)...");
        const principal2Email = "vp" + Math.floor(Math.random() * 10000) + "@debug.com";
        const principal2Payload = {
            name: "Vice Principal Debug",
            email: principal2Email,
            password: "password123",
            schoolCode: SCHOOL_CODE,
            role: "PRINCIPAL"
        };

        const principal2Res = await axios.post(`${API_URL}/join-school`, principal2Payload);
        console.log("✅ 2nd Principal Joined!");
        console.log("   Principal 2 ID:", principal2Res.data.userId);

        console.log("\n🎉 ALL TESTS PASSED!");

    } catch (error) {
        console.error("\n❌ TEST FAILED");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testAuth();
