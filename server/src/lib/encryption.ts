import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
    const key = process.env.REFRESH_TOKEN_ENC_KEY;
    if (!key) {
        throw new Error("REFRESH_TOKEN_ENC_KEY is not set");
    }
    const buf = Buffer.from(key, "base64");
    if (buf.length !== 32) {
        throw new Error(
            "REFRESH_TOKEN_ENC_KEY must decode to 32 bytes (base64)",
        );
    }
    return buf;
}

// Encrypts a plaintext string into "iv.authTag.ciphertext", all base64.
export function encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const ciphertext = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [iv, authTag, ciphertext].map((b) => b.toString("base64")).join(".");
}

// Reverses encrypt() IE throws if the payload was tampered with or the key is wrong.
export function decrypt(payload: string): string {
    const [ivB64, authTagB64, ciphertextB64] = payload.split(".");
    if (!ivB64 || !authTagB64 || !ciphertextB64) {
        throw new Error("Malformed encrypted payload");
    }

    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");
    const ciphertext = Buffer.from(ciphertextB64, "base64");

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]).toString("utf8");
}
