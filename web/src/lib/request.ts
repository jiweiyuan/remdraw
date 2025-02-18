import axios from 'axios';
import {getToken} from "@/lib/token.ts";

const service = axios.create({
    baseURL: import.meta.env.VITE_REMDRAW_API_PREFIX,
    timeout: 99999,
});

service.interceptors.request.use(
    (config) => {

        const token = getToken();
        if (!token) {
            window.location.href = '/login';
        }
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.log("error", error);
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default service;
