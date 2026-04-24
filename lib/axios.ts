import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const storage = typeof window !== 'undefined' ? localStorage.getItem('hostel-auth') : null;
    
    if (storage) {
        const parsedStorage = JSON.parse(storage);
        const token = parsedStorage?.state?.token;
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});