import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";

declare module "express-session" {
    interface SessionData {
        userId?: string;
        provider?: "spotify" | "apple";
        accessToken?: string;
        accessTokenExpiresAt?: number;
    }
}

const PgSession = connectPgSimple(session);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const sessionMiddleware = session({
    store: new PgSession({
        pool,
        tableName: "session",
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
});
