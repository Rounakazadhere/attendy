import axios from 'axios';
import config from './config';

const setupAxios = () => {
    // Set base URL
    axios.defaults.baseURL = config.API_URL;

    // Request Interceptor: Attach Token
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response Interceptor: Handle 401 (Auto Logout) - Optional but good practice
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                console.error("Session Expired or Unauthorized. Logging out...");
                // Optional: localStorage.clear(); window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxios;
