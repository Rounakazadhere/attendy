import axios from 'axios';

const API_URL = 'http://localhost:5555/api/auth';

const run = async () => {
    console.log("--- DIAGNOSTIC: Testing Password Update Route ---");
    try {
        // 1. We mock the call. If the route exists, it should probably return 401 (Unauthorized) or 400 (Bad Request)
        // If it returns 404, the route is MISSING (Server needs restart).

        await axios.put(`${API_URL}/updatepassword`, {});
    } catch (error) {
        if (error.response) {
            console.log(`Response Status: ${error.response.status}`);
            if (error.response.status === 404) {
                console.error("❌ FAILURE: Route not found (404). THE SERVER NEEDS RESTART.");
            } else if (error.response.status === 401) {
                console.log("✅ SUCCESS: Route exists (Got 401 Unauthorized as expected without token).");
            } else {
                console.log(`ℹ️ Result: Got ${error.response.status} (Route likely exists).`);
            }
        } else {
            console.error("❌ Network Error (Server might be down):", error.message);
        }
    }
};

run();
