
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.loadEnvFile(path.join(__dirname, '.env'));

const API_URL = 'http://localhost:5555/api';

const log = (msg, type = 'info') => {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
    console.log(`${icons[type]} ${msg}`);
};
const logError = (prefix, e) => {
    if (e.response) {
        log(`${prefix} Failed: Status ${e.response.status} - ${JSON.stringify(e.response.data)}`, 'error');
    } else {
        log(`${prefix} Failed: ${e.message}`, 'error');
    }
};

const run = async () => {
    try {
        console.log("========================================");
        console.log("   DEEP FEATURE VERIFICATION PROTOCOL   ");
        console.log("========================================");

        // 1. PRINCIPAL FLOW
        log("Testing PRINCIPAL Flow...", 'info');
        let principalToken;
        try {
            const login = await axios.post(`${API_URL}/auth/login`, {
                email: 'principal@test.com', password: 'password123', claimedRole: 'PRINCIPAL', secretCode: 'PRI@2025'
            });
            const otpRes = await axios.post(`${API_URL}/auth/verify-otp`, { email: 'principal@test.com', otp: '123456' });
            principalToken = otpRes.data.token;
            log("Principal Login: Success", 'success');
        } catch (e) {
            log(`Principal Login Failed: ${e.response?.data?.message || e.message}`, 'error');
            process.exit(1);
        }

        // 1.1 Check Dashboard Stats
        try {
            await axios.get(`${API_URL}/dashboard/summary`, { headers: { Authorization: `Bearer ${principalToken}` } });
            log("Principal Dashboard Stats: Accessible", 'success');
        } catch (e) {
            logError("Principal Dashboard", e);
        }

        // 1.2 Check Staff Attendance
        try {
            await axios.get(`${API_URL}/staff/stats/today`, { headers: { Authorization: `Bearer ${principalToken}` } });
            log("Principal Staff Attendance: Accessible", 'success');
        } catch (e) {
            logError("Principal Staff Attendance", e);
        }

        // 2. TEACHER FLOW
        log("\nTesting TEACHER Flow...", 'info');
        let teacherToken;
        try {
            const login = await axios.post(`${API_URL}/auth/login`, {
                email: 'teacher@test.com', password: 'password123', claimedRole: 'STAFF', secretCode: 'TEA@2025'
            });
            const otpRes = await axios.post(`${API_URL}/auth/verify-otp`, { email: 'teacher@test.com', otp: '123456' });
            teacherToken = otpRes.data.token;
            log("Teacher Login: Success", 'success');
        } catch (e) {
            logError("Teacher Login", e);
        }

        // 2.1 My Plans
        try {
            await axios.get(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${teacherToken}` } });
            log("Teacher Plans: Accessible", 'success');
        } catch (e) {
            logError("Teacher Plans", e);
        }

        // 2.2 Apply Leave
        try {
            await axios.post(`${API_URL}/leave/apply`, {
                type: 'Casual', dates: ['2025-01-10', '2025-01-11'], reason: 'Deep Test'
            }, { headers: { Authorization: `Bearer ${teacherToken}` } });
            log("Teacher Leave Application: Success", 'success');
        } catch (e) {
            logError("Teacher Leave", e);
        }

        // 2.3 Check Students
        try {
            await axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${teacherToken}` } });
            log("Teacher Student List: Accessible", 'success');
        } catch (e) {
            logError("Teacher Student List", e);
        }

        // 3. ADMIN FLOW (State/District)
        log("\nTesting ADMIN Flow...", 'info');
        let adminToken;
        try {
            try {
                await axios.post(`${API_URL}/auth/register-admin`, {
                    name: "Test Admin", email: "admin2@test.com", password: "password123", role: "DISTRICT_ADMIN", mobile: "1231231234"
                });
            } catch (e) { }

            const login = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin2@test.com', password: 'password123', claimedRole: 'DISTRICT_ADMIN', secretCode: 'ADM@2025'
            });
            const otpRes = await axios.post(`${API_URL}/auth/verify-otp`, { email: 'admin2@test.com', otp: '123456' });
            adminToken = otpRes.data.token;
            log("Admin Login: Success", 'success');
        } catch (e) {
            logError("Admin Login", e);
        }

        if (adminToken) {
            // 3.1 Check All Leaves (Pending)
            try {
                await axios.get(`${API_URL}/leave/pending`, { headers: { Authorization: `Bearer ${adminToken}` } });
                log("Admin Pending Leaves: Accessible", 'success');
            } catch (e) {
                logError("Admin Pending Leaves", e);
            }
        }

        console.log("\n========================================");
        console.log("   VERIFICATION COMPLETE   ");
        console.log("========================================");

    } catch (err) {
        console.error("FATAL ERROR:", err);
    }
};

run();
