import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";

import type { User } from "../types";
import { getUser, logout as apiLogout } from "../api/user";

interface AuthContextValue {
    user: User | null;
    loading: boolean; // Use whenever checking something that requires auth
    error: string;
    setError: (error: string) => void;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    // The session cookie is httpOnly, so the only way to know who's logged in is asking the server
    useEffect(() => {
        getUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiLogout();
        } catch {
            // Clear local state even if the request fails
        }
        setUser(null);
        setError("");
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                setError,
                setUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
