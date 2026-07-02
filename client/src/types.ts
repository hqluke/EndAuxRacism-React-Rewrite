// Shape returned by /auth/me, /auth/login, and /auth/register.
export interface User {
    id: string;
    provider: "spotify" | "apple";
    email?: string | null;
    username?: string;
}
