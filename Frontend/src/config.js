// Automatically detect environment
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Export the API URL
// If running locally, use localhost:3000
// If deployed (e.g. Render, Vercel), use the production backend
export const API_BASE_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://itecony-neriva-backend.onrender.com';
