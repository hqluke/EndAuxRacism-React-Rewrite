import axios from "axios";

export const baseURL = `${import.meta.env.VITE_SERVER_URL || ""}`;

const api = axios.create({
    baseURL,
    timeout: 10_000,
    // Session lives in an httpOnly cookie, without this the browser
    // never sends connect.sid on cross-origin requests
    withCredentials: true,
});

export default api;
