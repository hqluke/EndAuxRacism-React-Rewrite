import api, { baseURL } from "./client";
import type { User } from "../types";

// Data server expects to receive from the client.
interface AppleRegisterData {
    email: string;
    username: string;
    password: string;
}

interface AppleLoginData {
    email: string;
    password: string;
}

// OAuth needs a full-page navigation, not XHR: the server redirects to accounts.spotify.com,
// Spotify redirects back to the server's /callback, and the server redirects here with the
// session cookie already set.
export const spotifyLogin = () => {
    window.location.href = `${baseURL}/auth/spotify/login`;
};

export const logout = async () => {
    await api.get("/auth/logout");
};

export const getUser = async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data.user;
};

export const register = async (data: AppleRegisterData): Promise<User> => {
    const response = await api.post("/auth/register", data);
    return { ...response.data.user, provider: "apple" };
};

export const appleLogin = async (data: AppleLoginData): Promise<User> => {
    const response = await api.post("/auth/login", data);
    return { ...response.data.user, provider: "apple" };
};
