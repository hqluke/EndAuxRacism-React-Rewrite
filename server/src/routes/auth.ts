import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../db";
import { encrypt } from "../lib/encryption";
// bcrypt-ts has only named exports
import { hash, compare } from "bcrypt-ts";

const router = Router();

// Encodes a buffer into a URL-safe base64 string so we can use it in URLs (IE send to spotify and put in cookies)
function base64url(buffer: Buffer) {
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

// Register apple user
// Uses bcyrpt to hash password
router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Invalid email" });
        }

        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "Invalid username or password" });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                error: "Username must be between 3 and 20 characters",
            });
        }

        if (password.length < 8 || password.length > 50) {
            return res.status(400).json({
                error: "Password must be between 8 and 50 characters",
            });
        }

        const hashed = await hash(password, 12);

        const user = await prisma.appleUser.create({
            data: {
                email,
                username,
                passwordHash: hashed,
            },
        });

        req.session.userId = user.id;
        req.session.provider = "apple";

        // Pass in relevant user data to client
        res.status(200).json({
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (e: any) {
        // Alert user what failed during signup
        if (e.code === "P2002") {
            const target: string[] = e.meta?.target ?? [];
            if (target.includes("username")) {
                return res.status(409).json({
                    error: "Username taken",
                });
            }
            return res
                .status(409)
                .json({ error: "Email already has an account" });
        }
        console.error("register failed:", e);
        res.status(500).json({ error: "Signup failed" });
    }
});

// Non Spotify user login
// Uses bycrpt to hash password
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = await prisma.appleUser.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
    }

    const valid = await compare(password, user.passwordHash);

    if (!valid) {
        return res.status(400).json({ error: "Invalid email or password" });
    }

    req.session.userId = user.id;
    req.session.provider = "apple";

    // Pass in relevant user data to client
    res.status(200).json({
        user: { id: user.id, username: user.username, email: user.email },
    });
});

// Returns the logged-in user for the current session, or 401 if none.
// The client can't read session data itself (connect.sid is httpOnly and
// only points at a row server-side), so it calls this on load to hydrate.
router.get("/me", async (req, res) => {
    if (!req.session.userId || !req.session.provider) {
        return res.status(401).json({ error: "Not logged in" });
    }

    if (req.session.provider === "spotify") {
        const user = await prisma.spotifyUser.findUnique({
            where: { id: req.session.userId },
        });
        if (!user) return res.status(401).json({ error: "Not logged in" });
        return res.status(200).json({
            user: {
                id: user.id,
                provider: "spotify",
                username: user.displayName,
                email: user.email,
            },
        });
    }

    const user = await prisma.appleUser.findUnique({
        where: { id: req.session.userId },
    });
    if (!user) return res.status(401).json({ error: "Not logged in" });
    res.status(200).json({
        user: {
            id: user.id,
            provider: "apple",
            username: user.username,
            email: user.email,
        },
    });
});

// Destroy session and clear cookie
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("connect.sid");

        res.redirect(process.env.FRONT_END_URL!);
    });
});

// SPOTIFY user login
router.get("/spotify/login", (_req, res) => {
    // Generate state and code verifier so we can verify the callback
    const state = base64url(crypto.randomBytes(16));
    const code_verifier = base64url(crypto.randomBytes(32));
    const code_challenge = base64url(
        crypto.createHash("sha256").update(code_verifier).digest(),
    );

    // Set cookies to compare with the callback
    res.cookie("spotify_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
    });
    res.cookie("spotify_oauth_verifier", code_verifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
    });

    // Pass in what we need to Spotify to redirect back to us
    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        scope: "user-read-email user-read-private user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative user-library-read",
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        state,
        code_challenge_method: "S256",
        code_challenge,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

router.get("/spotify/callback", async (req, res) => {
    // Verify state and code verifier
    const { code, state } = req.query;
    const savedState = req.cookies.spotify_oauth_state;
    const code_verifier = req.cookies.spotify_oauth_verifier;

    if (!code || !state || state !== savedState) {
        return res.status(400).json({ error: "Invalid state" });
    }

    // Get access token & refresh token from Spotify
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code as string,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
            client_id: process.env.SPOTIFY_CLIENT_ID!,
            code_verifier,
        }),
    });

    if (!tokenRes.ok) {
        return res.status(400).json({ error: "Token exchange failed" });
    }

    const { access_token, refresh_token, expires_in } = await tokenRes.json();

    // Get user profile from Spotify
    const profileRes = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    const profile = await profileRes.json();

    // Encrypt refresh token so we can store it in the DB
    const encryptedRefreshToken = encrypt(refresh_token);

    // Upsert user in DB
    const user = await prisma.spotifyUser.upsert({
        where: {
            spotifyId: profile.id,
        },
        create: {
            spotifyId: profile.id,
            displayName: profile.display_name,
            email: profile.email,
            refreshTokenEncrypted: encryptedRefreshToken,
        },
        update: {
            displayName: profile.display_name,
            email: profile.email,
            refreshTokenEncrypted: encryptedRefreshToken,
            lastSeen: new Date(),
        },
    });

    // Add to session. userId is our internal id, not Spotify's
    req.session.userId = user.id;
    req.session.provider = "spotify";
    req.session.accessToken = access_token;
    req.session.accessTokenExpiresAt = Date.now() + expires_in * 1000;

    // Clear cookies
    res.clearCookie("spotify_oauth_state");
    res.clearCookie("spotify_oauth_verifier");

    res.redirect(process.env.FRONT_END_URL!);
});

export default router;
